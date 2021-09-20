import {
  ILabShell,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IRetroShell } from '@retrolab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { requestAPI } from './handler';

import { ToolbarButton } from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { INotebookModel, NotebookPanel } from '@jupyterlab/notebook';

import { IDisposable } from '@lumino/disposable';

import { Title, Widget } from '@lumino/widgets';

import { DataDisplayWidget } from './widget'

var nbPath: string; // relative path of currently active tab
var currNbPath: string; // relative path of notebook being measured
var cpu: number;
var dram: number;
var gpu: number;
var time: string;
var prevNbs: any = {};
var nbName: string;

// Create button on the toolbar
export class ButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
    
  constructor(app: JupyterFrontEnd) { 
      this.app = app;
  }
  
  readonly app: JupyterFrontEnd
  
  // Create the "Measure Energy" toolbar button
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {

    let mybutton = new ToolbarButton({ 
      label: 'Measure Energy Usage',
      onClick: async () => {   
        // send post request to Jupyter server containing relative
        // path to .ipynb file
        currNbPath = nbPath
        nbName = currNbPath.slice((currNbPath.lastIndexOf('/') + 1), currNbPath.indexOf('.ipynb'));
        console.log(nbName);
        console.log(prevNbs[nbName]);

        // check if notebook has already been measured and give it the correct name
        if (prevNbs[nbName] >= 1)
        {
            prevNbs[nbName] += 1;
            console.log('if');
        }
        else
        {
            prevNbs[nbName] = 1;
            console.log('else');
        }
        console.log(prevNbs[nbName]);
        const dataToSend = { file: currNbPath, run_num: prevNbs[nbName] };
          
        try {
          const reply = await requestAPI<any>('hello', {
            body: JSON.stringify(dataToSend),
            method: 'POST'
          });
          cpu = reply.CPU;
          dram = reply.DRAM;
          gpu = reply.GPU;
          time = reply.TIME;
          console.log("reply: ", reply);
        } catch (reason) {
          console.error(
            `Error on POST /jupyterlab-power-and-energy/hello ${dataToSend}.\n${reason}`
          );
        } 

        this.app.commands.execute('greencode:display-results');
      }   
    });
    // Add the toolbar button to the notebook toolbar
    panel.toolbar.insertItem(10, 'MeasureEnergyUsage', mybutton);
    console.log("MeasEnerUsage activated");

    // The ToolbarButton class implements `IDisposable`, so the
    // button *is* the extension for the purposes of this method.
    return mybutton;
  }
}

/**
 * Initialization data for the server-extension-example extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'server-extension-example',
  autoStart: true,
  optional: [ILauncher],
  requires: [ICommandPalette],
  activate: async (
    app: JupyterFrontEnd,
    palette: ICommandPalette
  ) => {
      
    console.log('JupyterLab extension server-extension-example is activated!');
    // create window and display results
    const command: string = 'greencode:display-results';
    app.commands.addCommand(command, {
        label: 'Energy Measurements',
        execute: () => {
            const content = new DataDisplayWidget();
            content.getData(cpu, dram, gpu, time);
            const widget = new MainAreaWidget<DataDisplayWidget>({ content });
            widget.id = nbName + '-results-' + prevNbs[nbName].toString();
            widget.title.label = nbName + ' run ' + prevNbs[nbName].toString();
            widget.title.closable = true;

            // Attach the widget to the main work area
            app.shell.add(widget, 'main');
            // Activate the widget
            app.shell.activateById(widget.id);
        }
    });
    // Add the command to the palette.
    palette.addItem({ command, category: 'Tutorial' });
    
    // create "Measure Energy" button
    const your_button = new ButtonExtension(app);
    app.docRegistry.addWidgetExtension('Notebook', your_button);

    // Get name and relative path of active notebook tab
    var shell = app.shell as ILabShell | IRetroShell; 

    // When user changes tabs, update nbPath to be current notebook path
    const onTitleChanged = (title: Title<Widget>) => {
      if (title.caption != '') {
        nbPath = title.caption;
        nbPath = nbPath.slice(nbPath.indexOf("Path: ") + 6, nbPath.indexOf("Last Saved") - 1);
        console.log(nbPath);
      }
    };

    // Watch for user changing tabs in JupyterLab
    shell.currentChanged.connect((_: any, change: any) => {
      const { oldValue, newValue } = change;

      if (oldValue) {
        oldValue.title.changed.disconnect(onTitleChanged);
      }
      if (newValue) {
        newValue.title.changed.connect(onTitleChanged);
      }
    });
  }
};

export default extension;
