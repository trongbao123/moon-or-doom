'use client'
import React, { useEffect, useRef, useState } from 'react'
import Highcharts from 'highcharts'
import './page.css'
import { Stack } from '@chakra-ui/react'
import { formatPrice } from '@/utils/formatPrice'

const CURRENT_PRICE = 3300
type DataChart = {
    x: number
    y: number
}

const DynamicChart: React.FC = () => {
    const [data, setData] = useState<DataChart[]>([])
    const currentPriceRef = useRef(CURRENT_PRICE)
    const chartRef = useRef<Highcharts.Chart | null>(null)
    const currentTimeRef = useRef(new Date().getTime())
    const endTimeRef = useRef(currentTimeRef.current + 50000)

    useEffect(() => {
        const initData: DataChart[] = []
        const time = new Date().getTime()
        for (let i = -80; i <= 0; i += 1) {
            initData.push({
                x: time + i * 1000,
                y: currentPriceRef.current + (Math.random() * 2 - 1)
            })
        }
        setData(initData)
    }, [])

    useEffect(() => {
        const onChartLoad = function (this: Highcharts.Chart) {
            const chart: Highcharts.Chart = this as Highcharts.Chart
            const series = chart.series[0]
            chartRef.current = chart

            let lastUpdate = 0
            if (series && series.data.length > 0) {
                chart.tooltip.refresh(series.data[0])
            }
            const updateChart = (timestamp: number) => {
                if (timestamp - lastUpdate >= 1200) {
                    const x = new Date().getTime()
                    const y = currentPriceRef.current + (Math.random() * 2 - 1)
                    series.addPoint([x, y], true, true)
                    chart.tooltip.refresh(series.data[series.data.length - 1])
                    document.querySelectorAll('.highcharts-plot-line-label').forEach((label, index) => {
                        label.classList.add(`custom-label${index === 1 ? `-${index}` : ''}`)
                    })

                    document.querySelectorAll('.highcharts-label').forEach((label) => {
                        const lastDataPoint = series.data[series.data.length - 1]
                        const yValue = lastDataPoint && lastDataPoint.y !== undefined ? Number(lastDataPoint.y.toFixed(2)) : 0
                        label.classList.add(`custom-tooltip${currentPriceRef.current <= yValue ? `-reduce` : '-increase'}`)
                    })
                    lastUpdate = timestamp
                }
                requestAnimationFrame(updateChart)
            }

            requestAnimationFrame(updateChart)
        }

        Highcharts.chart({
            chart: {
                renderTo: 'container',
                type: 'spline',
                events: { load: onChartLoad },
                backgroundColor: '#1A202C',
                animation: { duration: 1000, easing: 'easeInOutQuad' }
            },
            time: { timezoneOffset: new Date().getTimezoneOffset() },
            title: { text: '' },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 100,
                maxPadding: 0.1,
                gridLineWidth: 1,
                gridLineColor: '#444',
                labels: {
                    format: '{value:%H:%M:%S}',
                    style: { color: '#fff' },
                },
                plotLines: [
                    {
                        value: currentTimeRef.current,
                        color: '#fd853a',
                        width: 2,
                        label: {
                            text: `<span style="white-space: nowrap">Current</span>`,
                            align: 'right',
                            style: { width: 50, height: 50 },
                            useHTML: true,
                        },
                        className: 'plot-line-x',
                        dashStyle: 'Dash',
                    },
                    {
                        value: endTimeRef.current,
                        color: '#fd853a',
                        width: 2,
                        label: {
                            text: `<span style="white-space: nowrap">End</span>`,
                            align: 'right',
                            style: { width: 50, height: 50 },
                            useHTML: true,
                        },
                        dashStyle: 'Dash',
                    },
                ],
            },
            yAxis: {
                title: { text: '' },
                labels: { style: { color: '#fff' } },
                gridLineWidth: 1,
                gridLineColor: '#444',
                opposite: true,
                plotLines: [
                    {
                        value: currentPriceRef.current,
                        color: '#fd853a',
                        width: 2,
                        className: 'plot-line-y',
                        acrossPanes: true,
                        label: {
                            text: `<span style="white-space: nowrap">${formatPrice(currentPriceRef.current)}</span>`,
                            align: 'right',
                            style: { width: 50, height: 50 },
                            useHTML: true,
                        },
                        dashStyle: 'Dash',
                    },
                ],
            },
            tooltip: {
                split: false,
                backgroundColor: 'transparent',
                animation: { duration: 900, easing: 'easeInOutQuad' },
                shadow: false,
                borderWidth: 0,
                useHTML: true,
                formatter: function () {
                    const value = this.y?.toFixed(2)
                    const className = currentPriceRef.current <= Number(value) ? 'custom-tooltip-reduce' : 'custom-tooltip-increase'
                    return `<div class="highcharts-label ${className}">${value}</div>`
                },
                positioner: function (labelWidth, labelHeight, point) {
                    return {
                        x: point.plotX + 20,
                        y: point.plotY - labelHeight / 2,
                    }
                },
            },
            legend: { enabled: false },
            exporting: { enabled: false },
            series: [
                {
                    lineWidth: 3,
                    color: '#ccfd07',
                    type: 'spline',
                    data: data,
                    animation: { duration: 1400, easing: 'easeInOutQuad' },
                    marker: { enabled: false },
                },
            ],
        })
    }, [data])

    useEffect(() => {
        const interval = setInterval(() => {
            const change = (Math.random() * 2 - 1).toFixed(2)
            currentPriceRef.current += parseFloat(change)
            currentTimeRef.current = endTimeRef.current
            endTimeRef.current = currentTimeRef.current + 50000

            if (chartRef.current) {
                chartRef.current.xAxis[0].update({
                    plotLines: [
                        {
                            value: currentTimeRef.current,
                            color: '#fd853a',
                            width: 2,
                            label: {
                                text: `<span style="white-space: nowrap">Current</span>`,
                                align: 'right',
                                style: { width: 50, height: 50 },
                                useHTML: true,
                            },
                            dashStyle: 'Dash',
                        },
                        {
                            value: endTimeRef.current,
                            color: '#fd853a',
                            width: 2,
                            label: {
                                text: `<span style="white-space: nowrap">End</span>`,
                                align: 'right',
                                style: { width: 50, height: 50 },
                                useHTML: true,
                            },
                            dashStyle: 'Dash',
                        },
                    ],
                })
                
                chartRef.current.yAxis[0].update({
                    plotLines: [
                        {
                            value: currentPriceRef.current,
                            color: '#fd853a',
                            width: 2,
                            className: 'plot-line-y',
                            acrossPanes: true,
                            label: {
                                text: `<span style="white-space: nowrap">${formatPrice(currentPriceRef.current)}</span>`,
                                align: 'right',
                                style: { width: 50, height: 50 },
                                useHTML: true,
                            },
                            dashStyle: 'Dash',
                        },
                    ],
                })

                document.querySelectorAll('.highcharts-plot-line-label').forEach((label, index) => {
                    label.classList.add(`custom-label${index === 1 ? `-${index}` : ''}`)
                })
            }
        }, 50000)
        return () => clearInterval(interval)
    }, [])

    return (
        <Stack className="highcharts-figure">
            <div id="container" />
        </Stack>
    )
}

export default DynamicChart
