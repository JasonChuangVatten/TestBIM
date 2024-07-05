const jsonDir = "./file";
const danger = "btn-danger";
const success = "btn-success";
const stop = "btn-stop";
const api_url = 'https://tpc.hmidata.tw/ScadaApi/ValueList';

$(function () {
    'use strict';

    showAlarmChart([130, 70, 126, 200, 120]);

    showParams('params.json');
});

function loadJSON(filename) {
    const url = jsonDir + "/" + filename;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            //console.log("params:");
            //console.log(data);
            return data;
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

async function showParams(filename) {
    const data = await loadfetchJsonData(filename); // 獲取 JSON 對象
    if (data) {
        console.log("params:");
        console.log(data);

        let num_bim = data.num_bim;
        let status_bim = data.status_bim;
        let alert_chart_bim = data.alert_chart_bim;
        let oil_chart_bim = data.oil_chart_bim;

        //處理num_bim資料
        let objData1 = {
            "tagname": num_bim
        };
        $.ajax({
            url: api_url,
            data: JSON.stringify(objData1),
            method: "POST",
            contentType: "application/json;",
            success: function (numData) {
                if (numData) {
                    console.log("num_bim success");
                    showNumData(numData);
                } else {
                    console.log("num_bim fail");
                    displayNumData('testnum.json');
                }
            },
            error: function (xhr, status, err) {
                console.log("system error");
                console.log(xhr.responseText);
                return false;
            }
        });

        //處理status_bim資料
        let objData2 = {
            "tagname": status_bim
        };
        $.ajax({
            url: api_url,
            data: JSON.stringify(objData2),
            method: "POST",
            contentType: "application/json;",
            success: function (statusData) {
                if (statusData) {
                    console.log("status_bim success");
                    showStatusData(statusData);
                } else {
                    console.log("status_bim fail");
                    displayStatusData('teststatus.json');
                }
            },
            error: function (xhr, status, err) {
                console.log("system error");
                console.log(xhr.responseText);
                return false;
            }
        });

        //處理oil_chart_bim資料
        let objData3 = {
            "tagname": oil_chart_bim
        };
        $.ajax({
            url: api_url,
            data: JSON.stringify(objData3),
            method: "POST",
            contentType: "application/json;",
            success: function (oil_chart) {
                if (oil_chart && oil_chart > 0) {
                    console.log("oil_chart success");
                    showOilChart(oil_chart);
                } else {
                    console.log("oil_chart fail");
                    showOilChart(85);
                }
            },
            error: function (xhr, status, err) {
                console.log("system error");
                console.log(xhr.responseText);
                return false;
            }
        });

        console.log(alert_chart_bim);
    }
}

async function loadfetchJsonData(filename) {
    try {
        const url = jsonDir + "/" + filename;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data; // 返回解析後的 JSON 對象
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function displayNumData(filename) {
    const data = await loadfetchJsonData(filename); // 獲取 JSON 對象
    if (data) {
        console.log("displayNumData:");
        console.log(data);

        showNumData(data);
    }
}

function showNumData(data) {
    $(data).each(function (index, tag) {
        $("#" + tag.tagname).html(tag.value);
    });
}

async function displayStatusData(filename) {
    const data = await loadfetchJsonData(filename); // 獲取 JSON 對象

    if (data) {
        console.log("displayStatusData");
        console.log(data);
        showStatusData(data);
    }
}

function showStatusData(data) {

    $(data.retdata).each(function (index, tag) {
        switch (tag.tagname) {
            //消防告警
            case "3D_CO_FIR_000_ERYALA": //即早
            case "3D_CO_FIR_000_AIRALA": //氣霧
            case "3D_CO_FIR_000_FOMALA": //泡沫
            case "3D_CO_FIR_000_OILALA": //燃油
                if (tag.value && tag.value == "1") {
                    $("#" + tag.tagname).removeClass(success).addClass(danger);
                } else if (tag.value && tag.value == "0") {
                    $("#" + tag.tagname).removeClass(danger).addClass(success);
                }
                break;
            //發電機運轉狀態
            case "RF_DI_IRG_G01_GENSTA":
            case "RF_DI_IRG_G02_GENSTA":
            case "RF_DI_IRG_G03_GENSTA":
            case "RF_DI_BFG_G04_GENSTA":
                if (tag.value && tag.value == "1") {
                    $("#" + tag.tagname).removeClass(stop).addClass(danger);
                    $("#" + tag.tagname).html('運轉');
                } else if (tag.value && tag.value == "0") {
                    $("#" + tag.tagname).removeClass(danger).addClass(stop);
                    $("#" + tag.tagname).html('停止');
                }
                break;
            //引風機告警狀態
            case "3D_AI_EAF_000_STASUS":
                if (tag.value && tag.value == "1") {
                    $("#" + tag.tagname).removeClass(stop).addClass(danger);
                    $("#" + tag.tagname).html('運轉');
                } else if (tag.value && tag.value == "0") {
                    $("#" + tag.tagname).removeClass(danger).addClass(stop);
                    $("#" + tag.tagname).html('停止');
                }
                break;
            //停車場空氣告警狀態
            case "3D_AI_MFS_001_CODALA":
            case "3D_AI_MFS_001_CO2ALA":
                if (tag.value && tag.value == "1") {
                    $("#" + tag.tagname).removeClass(success).addClass(danger);
                    $("#" + tag.tagname).html('危險');
                } else if (tag.value && tag.value == "0") {
                    $("#" + tag.tagname).removeClass(danger).addClass(success);
                    $("#" + tag.tagname).html('安全');
                }
                break;
            default:
                break;
        }
    });
}


function showAlarmChart(alarmdata) {
    // 告警
    if ($("#alarm-chart").length) {
        const ctx = document.getElementById('alarm-chart');

        var graphGradient1 = document.getElementById("alarm-chart").getContext('2d');

        var gradientStrokeBlue = graphGradient1.createLinearGradient(0, 0, 0, 90);
        gradientStrokeBlue.addColorStop(0, 'rgba(54, 215, 232, 1)');
        gradientStrokeBlue.addColorStop(1, 'rgba(177, 148, 250, 1)');

        const plugin = {
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart, args, options) => {
                const { ctx } = chart;
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = options.color;
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['溫度告警', '電力告警', '空調告警', '漏水告警', 'CCTV監控'],
                datasets: [{
                    axis: 'y',
                    cutout: 20,
                    data: alarmdata,
                    backgroundColor: [gradientStrokeBlue,],
                    hoverBackgroundColor: [gradientStrokeBlue],
                    borderColor: [gradientStrokeBlue],
                    legendColor: [gradientStrokeBlue],
                    barThickness: 24,
                }]
            },
            options: {
                indexAxis: 'y',
                animationEasing: "easeOutBounce",
                animateRotate: true,
                animateScale: false,
                responsive: true,
                maintainAspectRatio: false,
                showScale: false,
                legend: false,
                plugins: {
                    tooltip: {
                        enabled: false,
                    },
                    legend: {
                        display: false,
                    },
                    customCanvasBackgroundColor: {
                        color: 'transparent'
                    },
                    datalabels: {
                        display: "auto",
                        formatter: function (value, context) {
                            return value;
                        },
                        anchor: 'center',
                        align: 'center',
                        font: {
                            size: 15,
                            weight: '400'
                        },
                        color: '#FFF'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            display: false
                        },
                        border: {
                            display: false
                        },

                    },
                    y: {
                        grid: {
                            display: false,

                        },
                        border: {
                            display: false
                        },

                        // font
                        ticks: {
                            backdropColor: 'rgba(255, 255, 255, 0.75)',
                            padding: 3,
                            color: 'rgb(220, 53, 69)',
                            font: {
                                size: 15,
                                family: 'Arial',
                                weight: 'bold'
                            }
                        }

                    },
                }

            },
            plugins: [plugin, ChartDataLabels]
        });
    }
}

function showOilChart(oildata) {
    // oil
    if ($("#oil-chart").length) {
        const ctx = document.getElementById('oil-chart');

        var graphGradient1 = document.getElementById("oil-chart").getContext('2d');

        var gradientStrokeBlue = graphGradient1.createLinearGradient(0, 0, 0, 90);
        gradientStrokeBlue.addColorStop(0, 'rgba(54, 215, 232, 1)');
        gradientStrokeBlue.addColorStop(1, 'rgba(177, 148, 250, 1)');
        var gradientLegendBlue = 'rgba(54, 215, 232, 1)';

        const plugin = {
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart, args, options) => {
                const { ctx } = chart;
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = options.color;
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        };

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['油量'],
                datasets: [{
                    axis: 'y',
                    data: [oildata],
                    backgroundColor: [gradientStrokeBlue],
                    hoverBackgroundColor: [gradientStrokeBlue],
                    borderColor: [gradientStrokeBlue],
                    legendColor: [gradientStrokeBlue],
                    barPercentage: 1,
                    categoryPercentage: 1,
                }]
            },
            options: {
                indexAxis: 'y',
                cutout: 50,
                animationEasing: "easeOutBounce",
                animateRotate: true,
                animateScale: false,
                responsive: true,
                maintainAspectRatio: true,
                showScale: false,
                legend: false,
                plugins: {
                    tooltip: {
                        enabled: false,
                        // backgroundColor: "#000",
                        // titleColor: "#FFF",
                        // bodyColor: "#FFF"
                    },
                    legend: {
                        display: false,
                    },
                    customCanvasBackgroundColor: {
                        color: 'transparent'
                    },
                    datalabels: {
                        display: "auto",
                        formatter: function (value, context) {
                            return value + '%';
                        },
                        anchor: 'center',
                        align: 'center',
                        font: {
                            size: 40,
                            weight: '500'
                        },
                        color: '#FFF'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            backdropColor: 'rgba(255, 255, 255, 0.75)',
                            padding: 0,
                            color: '#777',
                            font: {
                                size: 14,
                                family: 'Arial',
                                weight: 'bold'
                            }
                        }
                    },
                }
            },
            plugins: [plugin, ChartDataLabels]
        });
    }
}


// 定義函式以傳送訊息給父系統
function callParentChangeMap(mapId) {
    //debugger;

    parent.postMessage({ type: 'changeMap', mapId: mapId }, 'https://tpc.hmidata.tw');
}

function callParentDoLogOut(typeId) {
    //debugger;

    parent.postMessage({ type: 'logout', typeId: typeId }, 'https://tpc.hmidata.tw');
}