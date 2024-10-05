import React, { useEffect, useRef, useState } from "react";
import "./dashboard.scss";
import { Container, Row, Form, Col } from 'react-bootstrap'
import Loginbg from '../../assets/images/rupess.svg'
import Users from '../../assets/images/users.svg'
import Station from '../../assets/images/station.svg'
import Charge from '../../assets/images/charge.svg'
import Uparrow from '../../assets/images/uparrow.svg'
import DownArrow from '../../assets/images/down-arrow-red.svg'
import Chart2 from '../../assets/images/chart2.svg'
import Chart1 from '../../assets/images/chart1.svg'
import Chart from "chart.js";
import WebService from "../../Services/WebService";
import VendorSelect from "../../components/VendorSelect/VendorSelect";
import EBDatePicker from "../../components/Common/EBDatePicker/EBDatePicker";
import loader from "../../assets/images/loader.gif";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";

const Dashboard = () => {
    const barChartRef = useRef<Chart | null>(null);
    const dougnutChart = useRef<Chart | null>(null);

    const [districtData, setDistrictData] = useState<any>();
    const [stateNames, setStateNames] = useState<any[]>([]);
    const [selectedState, setSelectedStateNames] = useState<any>({ "state_id": 13, "state_name": "Madhya Pradesh" });
    const lineChartRef = useRef<Chart | null>(null);
    const [districtAndUnit, setDistrictAndUnit] = useState<any>();
    const [startDate, setStartDate] = useState<any>(formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
    const [endDate, setEndDate] = useState<any>(formatDate(new Date()));
    const [chargeStationData, setChargeStationData] = useState<any>({});
    const [bookingData, setBookingData] = useState<any>({});
    const [showLoader, setShowLoader] = useState<Boolean>(true);
    const vendorId = useRef<any>();

    const userInfoData: any = useSelector<RootState, any>(
        (state: any) => state.userInfoData
    );

    useEffect(() => {
        const vendor_id = userInfoData.user_info.vendorId;
        vendorId.current = vendor_id || null;
        console.log(vendorId);
        getState();
    }, [userInfoData.user_info.vendorId]);

    useEffect(() => {
        setShowLoader(true)
        getBookingData();
    }, [startDate, endDate, vendorId.current]);

    const getState = () => {
        WebService.getAPI({
            action: `states`,
            body: {},
        })
            .then((res: any) => {
                let temp: any[] = [];
                let mpId = '';
                for (let i in res.data) {
                    temp.push({
                        ...res.data[i],
                        value: res.data[i].state_name,
                        id: res.data[i].state_id,
                    });
                    if (res.data[i].state_name == 'Madhya Pradesh') {
                        mpId = res.data[i].state_id;
                    }
                }
                setStateNames(temp);
                if (temp && temp.length > 0) {
                    if (mpId) {
                        setSelectedStateNames({ state_id: 13, state_name: 'Madhya Pradesh' });
                        getDistrictAndRevenue(mpId);
                        getDistrictAndUnit(mpId);
                    } else {
                        setSelectedStateNames({ state_id: temp[0].state_id, state_name: temp[0].state_name });
                        getDistrictAndRevenue(temp[0].state_id);
                        getDistrictAndUnit(temp[0].state_id); // fixed state_id typo
                    }
                }
            })
            .catch(() => {
                console.error("Error fetching states");
            });
    };

    function formatDate(date: any) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }
    const getChargeStationData = (vendorId: string) => {
        WebService.getAPI({ action: `charger-status`, body: {} })
            .then((res: any) => {
                if (res && res.data && res.data.length > 0) {
                    setChargeStationData(res.data[0]);
                }
            })
            .catch((e) => { });
    };

    const getBookingData = () => {
        var obj: any = { 'start_date': startDate, 'end_date': endDate }
        if (vendorId && vendorId.current) {
            obj["vendor_id"] = vendorId.current;
        }
        WebService.getAPI({ action: `booking-data`, body: obj })
            .then((res: any) => {
                if (res && res.data && res.data.length > 0) {
                    setBookingData(res.data[0]);
                    setShowLoader(false)
                }
            }).catch((e) => { setShowLoader(false) });
    };

    const getDistrictAndRevenue = (stateId: any) => {
        var obj: any = {};
        if (vendorId && vendorId.current) {
            // console.log("vendorId-------------> state", vendorId);
            obj["vendor_id"] = vendorId.current;
        }
        WebService.getAPI({ action: `state-wise-revenue?state=${stateId}&is_unit=false`, body: obj })
            .then((res: any) => {
                var temp: any = [];
                const names: any = [];
                const revenue: any = [];
                var totalRevenue: number = 0;
                res.data.forEach((item: any) => {
                    if (item) {
                        totalRevenue += item.revenue;
                    }
                });
                res.data.forEach((item: any) => {
                    if (item) {
                        var percantage = 0;
                        if (totalRevenue > 0 && item.revenue) {
                            percantage = (item.revenue * 100) / totalRevenue;
                        }
                        names.push(item.district_name + " (" + percantage.toFixed(2) + "%)");
                        revenue.push(item.revenue);
                    }
                });
                setDistrictData({ names, revenue });
            })
            .catch((e) => {
                console.error("Error fetching revenue data", e);
            });
    };

    const getDistrictAndUnit = (stateId: any) => {
        var obj: any = {};
        if (vendorId && vendorId.current) {
            obj["vendor_id"] = vendorId.current;
        }
        WebService.getAPI({ action: `state-wise-revenue?state=${stateId}&is_unit=true`, body: obj })
            .then((res: any) => {
                var temp: any = [];
                const names: any = [];
                const units: any = [];
                res.data.forEach((item: any) => {
                    if (item) {
                        names.push(item.charge_station_id);
                        units.push(item.unit);
                    }
                });
                setDistrictAndUnit({ "names": names, "units": units });
            })
            .catch((e) => { });
    };

    const CountryCanvas = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        if (dougnutChart.current) {
            dougnutChart.current.destroy();
        }
        const ctx = canvas.getContext("2d");
        if (ctx) {
            dougnutChart.current = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: districtData?.names,

                    datasets: [
                        {
                            data: districtData?.revenue,
                            backgroundColor: [
                                "rgb(255, 99, 132)",
                                "rgb(54, 162, 235)",
                                "rgb(255, 206, 86)",
                                "rgb(75, 192, 192)",
                                "rgb(153, 102, 255)",
                                "rgb(255, 159, 64)",
                                "rgb(0, 128, 0)",
                                "rgb(255, 0, 0)",
                                "rgb(0, 0, 255)",
                                "rgb(128, 128, 128)",
                            ],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {},
                    },
                    cutoutPercentage: 50,
                    legend: {
                        position: "bottom",
                        display: true,
                        labels: {
                            boxWidth: 15,
                            fontSize: 14

                        },
                    },
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    display: false,
                                },
                                gridLines: {
                                    display: false,
                                },
                                scaleLabel: {
                                    display: false,
                                    labelString: "Amount",
                                },
                            },
                        ],
                        xAxes: [
                            {
                                ticks: {
                                    display: false,
                                },
                                gridLines: {
                                    display: false,
                                },
                            },
                        ],
                    },
                },
            });
        }
    };

    const barChart = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        if (barChartRef.current) {
            barChartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {

            const data = districtAndUnit

            // Extract labels and data
            const labels = data?.names;
            const availableData = data?.units;
            
            barChartRef.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Available',
                            data: availableData,
                            backgroundColor: "#1360de",
                            barThickness: 58,

                        },

                    ],
                },
                options: {
                    plugins: {
                        datalabels: {
                            formatter: (value: any) => {
                                if (value === 0) return '';
                                return value + '%';
                            },
                        },
                    },
                    responsive: true,
                    layout: {
                        padding: {
                            left: 10,
                            top: 10
                        }
                    },
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            stacked: true,
                            gridLines: {
                                display: false
                            },
                        }],
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                beginAtZero: true,
                                max: 60,
                                stepSize: 10,
                                callback: function (value) {
                                    return value + " KW";
                                }
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "Kilo Watt"
                            }
                        }]
                    },
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData) {
                                const datasetIndex = tooltipItem.datasetIndex;
                                const index = tooltipItem.index;

                                if (datasetIndex !== undefined && index !== undefined) {
                                    const dataset = data.datasets![datasetIndex];
                                    const currentValue = dataset.data![index] as number;
                                    return dataset.label + ': ' + currentValue + '%';
                                }
                                return '';
                            }
                        }
                    }
                }
            });
        }
    };

    return (

        <>
            {showLoader === true ? (
                <div className="">
                    <div></div>
                    <div style={{ textAlign: "center", marginTop: "10%" }}>
                        <img
                            style={{ position: "relative" }}
                            src={loader}
                            alt="No loader found"
                        />
                        <div style={{ position: "relative", color: "white" }}>
                            Loading...
                        </div>
                    </div>
                </div>
            ) : null}

            <div className="container">
                <div className="justify-content-between d-flex mb-3 ">
                    <span className="d-flex align-items-center"><h5 className="mb-0">Dashboard</h5></span>
                    <Row className="mb-3 text-end">
                        <Col lg={6}>
                            <EBDatePicker
                                placeholderText="From Date"
                                selected={startDate}
                                onChange={(date: any) => setStartDate(date)}
                                maxData={new Date(endDate)}
                            />
                        </Col>
                        <Col lg={6}>
                            <EBDatePicker
                                placeholderText="To Date"
                                selected={endDate}
                                onChange={(date: any) => setEndDate(date)}
                                minData={new Date(startDate)}
                            />
                        </Col>
                    </Row>
                </div>
                {showLoader === false ? <>
                    <Row className="g-2 justify-content-between">
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Loginbg} /><br></br>
                                <span>TOTAL REVENUE</span>
                                <h3>{bookingData.revenue ? bookingData.revenue : 0}</h3>
                                <span className={bookingData.is_profit ? "updown" : "downStyle"}>{bookingData.parcentage}% <img src={bookingData.is_profit ? Uparrow : DownArrow} /></span>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Users} /><br></br>
                                <span>TOTAL USERES</span>
                                <h3>{chargeStationData.totalUser}</h3>
                                {/* <span className="updown">12% <img src={Uparrow} /></span> */}
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Station} /><br></br>
                                <span>TOTAL STATIONS</span>
                                <h3>{chargeStationData.totalStations}</h3>
                                {/* <span className="updown">12% <img src={Uparrow} /></span> */}
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Charge} /><br></br>
                                <span>TOTAL UNITS CHARGED</span>
                                <h3>{bookingData.unitCharged ? bookingData.unitCharged : 0} kwh</h3>
                                <span className={bookingData.is_profit ? "updown" : "downStyle"}>{bookingData.parcentage}% <img src={bookingData.is_profit ? Uparrow : DownArrow} /></span>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Charge} /><br></br>
                                <span>TOTAL NUMBERS OF CARS</span>
                                <h3>10,000</h3>
                                <span className="updown">12% <img src={Uparrow} /></span>
                            </div>
                        </div>
                    </Row>

                    <Row className="g-2 mt-3 justify-content-between">
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Loginbg} /><br></br>
                                <span>TOTAL CHARGERS IN PLACE</span>
                                <h3>{chargeStationData.totalChargers}</h3>
                                {/* <span className="updown">12% <img src={Uparrow} /></span> */}
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Users} /><br></br>
                                <span>ACTIVE CHARGERS</span>
                                <h3>{chargeStationData.activeChargers}</h3>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Station} /><br></br>
                                <span>OUT OF SERVICE CHARGERS</span>
                                <h3>{chargeStationData.outOfService}</h3>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Charge} /><br></br>
                                <span>CHARGERS CHARGING NOW</span>
                                <h3>{chargeStationData.charging}</h3>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="box p-3 dashboardup">
                                <img src={Charge} /><br></br>
                                <span>AVERAGE CARS/CHARGER</span>
                                <h3>30</h3>
                                {/* <span className="updown">29% <img src={Uparrow} /></span> */}
                            </div>
                        </div>
                    </Row>
                </> : ""}

                <Row className="g-3 mt-3">

                    <div className="col-lg-6">
                        <div className="box p-3 dashboardup">
                            <div className="d-flex justify-content-between">
                                <div className="boxheading">Top Stations</div>
                                <div>
                                    <div className="time-pickers position-relative w-100-mob w-100">
                                        <VendorSelect
                                            selected={13}
                                            isSearchable={true}
                                            options={stateNames ?? []}
                                            onChange={(e: any) => {
                                                getDistrictAndUnit(e.id);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <hr></hr></div>

                            <center>
                                <canvas ref={barChart} width={200} height={150}></canvas>
                                {/* <img src={Chart1} width="90%" className="my-4" /> */}
                            </center>
                        </div>

                    </div>
                    <div className="col-lg-6">
                        <div className="box p-3 dashboardup">
                            <div className="d-flex justify-content-between">
                                <div className="boxheading">Top Cities</div>
                                <div>
                                    <div className="time-pickers position-relative w-100-mob w-100">
                                        <VendorSelect
                                            selected={13}
                                            isSearchable={true}
                                            options={stateNames ?? []}
                                            onChange={(e: any) => {
                                                getDistrictAndRevenue(e.id);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <hr></hr></div>

                            <center>
                                <canvas ref={CountryCanvas} width={200} height={150}></canvas>
                                {/* <img src={Chart1} width="90%" className="my-4" /> */}
                            </center>
                        </div>

                    </div>
                </Row>

            </div>
        </>
    );
}

export default Dashboard;