import { ReactWidget } from '@jupyterlab/apputils';
import React from 'react'; //PREVIOUSLY CONTAINED { useState }
// import { render } from 'react-dom'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
    
/**
 * A Counter Lumino Widget that wraps a CounterComponent.
 */
export class DataDisplayWidget extends ReactWidget {
  /**
   * Constructs a new DataDisplayWidget.
   */
  options: any;
  constructor() {
    super();
    this.addClass('jp-ReactWidget');
    this.options = {};
  }
  
  /**
  * React component for a graph
  *
  * @returns The React component
  */
  DataDisplayComponent = (): JSX.Element => {
  
      return (
        <div>
          <HighchartsReact
            highcharts={Highcharts}
            options={this.options}
          />
        </div>
    );
  };
  
  // get energy usage data and set parameters for pie chart 
  getData(cpu: number, dram: number, gpu: number, time: string) {
    let totalEnergy = cpu + dram + gpu;
    this.options = {
      chart: {
        renderTo: 'container',
        plotBackgroundColor: 'rgba(0,0,0,0)',
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        margin: [100, 50, 50, 50],
        animation: false
      },
      credits: {
        enabled: false
      },
      title: {
        text: 'Energy Usage'
      },
      subtitle: {
        text: 'The program took ' + time + ' to execute, during which ' + totalEnergy.toFixed(2) + ' Joules of energy were consumed. See downloaded csvs for detailed power consumption info.'
      },
      tooltip: {
        pointFormat: '<b>{point.percentage:.2f}%</b>'
      },
      accessibility: {
        point: {
        valueSuffix: '%'
        }
      },
      plotOptions: {
        series: {
          dataLabels: { enabled: true },
          animation: false
        },
        pie: {
          allowPointSelect: false,
          cursor: 'pointer',
          startAngle: 90,
          dataLabels: {
            overflow: 'allow',
            crop: false,
            allowOverlap: true,
            enabled: true,
            format: '<b>{point.name}</b>: {point.y:.2f} J ({point.percentage:.2f}%)'
          },
          colors: [
            '#7cb5ec', // blue
            '#8085e9', // purple
            '#90ed7d', // green
          ]     
        }
      },
      series: [{
        data: [
          ['CPU',	     cpu],
          ['DRAM',      dram],
          ['GPU', gpu]
        ]
      }]
    }   
  }

  render(): JSX.Element {
    return (
      <div>
        <this.DataDisplayComponent />
      </div>  
    )
  }
}