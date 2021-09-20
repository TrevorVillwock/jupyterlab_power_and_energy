(self.webpackChunk_txst_greencode_jupyterlab_power_and_energy=self.webpackChunk_txst_greencode_jupyterlab_power_and_energy||[]).push([[15],{15:(e,t,n)=>{"use strict";n.r(t),n.d(t,{ButtonExtension:()=>C,default:()=>E});var o,a,r,s,l,i,c=n(120),d=n(383),p=n(331),u=n(66),g=n(271),m=n.n(g),h=n(840),y=n.n(h),b=n(518),w=n.n(b);class f extends c.ReactWidget{constructor(){super(),this.DataDisplayComponent=()=>m().createElement("div",null,m().createElement(w(),{highcharts:y(),options:this.options})),this.addClass("jp-ReactWidget"),this.options={}}getData(e,t,n,o){let a=e+t+n;this.options={chart:{renderTo:"container",plotBackgroundColor:"rgba(0,0,0,0)",plotBorderWidth:null,plotShadow:!1,type:"pie",margin:[100,50,50,50],animation:!1},credits:{enabled:!1},title:{text:"Energy Usage"},subtitle:{text:"The program took "+o+" to execute, during which "+a.toFixed(2)+" Joules of energy were consumed. See downloaded csvs for detailed power consumption info."},tooltip:{pointFormat:"<b>{point.percentage:.2f}%</b>"},accessibility:{point:{valueSuffix:"%"}},plotOptions:{series:{dataLabels:{enabled:!0},animation:!1},pie:{allowPointSelect:!1,cursor:"pointer",startAngle:90,dataLabels:{overflow:"allow",crop:!1,allowOverlap:!0,enabled:!0,format:"<b>{point.name}</b>: {point.y:.2f} J ({point.percentage:.2f}%)"},colors:["#7cb5ec","#8085e9","#90ed7d"]}},series:[{data:[["CPU",e],["DRAM",t],["GPU",n]]}]}}render(){return m().createElement("div",null,m().createElement(this.DataDisplayComponent,null))}}var x,v={};class C{constructor(e){this.app=e}createNew(e,t){let n=new c.ToolbarButton({label:"Measure Energy Usage",onClick:async()=>{x=(a=o).slice(a.lastIndexOf("/")+1,a.indexOf(".ipynb")),console.log(x),console.log(v[x]),v[x]>=1?(v[x]+=1,console.log("if")):(v[x]=1,console.log("else")),console.log(v[x]);const e={file:a,run_num:v[x]};try{const t=await async function(e="",t={}){const n=u.ServerConnection.makeSettings(),o=p.URLExt.join(n.baseUrl,"jupyterlab-power-and-energy",e);let a;try{a=await u.ServerConnection.makeRequest(o,t,n)}catch(e){throw new u.ServerConnection.NetworkError(e)}const r=await a.json();if(!a.ok)throw new u.ServerConnection.ResponseError(a,r.message);return r}("hello",{body:JSON.stringify(e),method:"POST"});r=t.CPU,s=t.DRAM,l=t.GPU,i=t.TIME,console.log("reply: ",t)}catch(t){console.error(`Error on POST /jupyterlab-power-and-energy/hello ${e}.\n${t}`)}this.app.commands.execute("greencode:display-results")}});return e.toolbar.insertItem(10,"MeasureEnergyUsage",n),console.log("MeasEnerUsage activated"),n}}const E={id:"server-extension-example",autoStart:!0,optional:[d.ILauncher],requires:[c.ICommandPalette],activate:async(e,t)=>{console.log("JupyterLab extension server-extension-example is activated!");const n="greencode:display-results";e.commands.addCommand(n,{label:"Energy Measurements",execute:()=>{const t=new f;t.getData(r,s,l,i);const n=new c.MainAreaWidget({content:t});n.id=x+"-results-"+v[x].toString(),n.title.label=x+" run "+v[x].toString(),n.title.closable=!0,e.shell.add(n,"main"),e.shell.activateById(n.id)}}),t.addItem({command:n,category:"Tutorial"});const a=new C(e);e.docRegistry.addWidgetExtension("Notebook",a);var d=e.shell;const p=e=>{""!=e.caption&&(o=(o=e.caption).slice(o.indexOf("Path: ")+6,o.indexOf("Last Saved")-1),console.log(o))};d.currentChanged.connect(((e,t)=>{const{oldValue:n,newValue:o}=t;n&&n.title.changed.disconnect(p),o&&o.title.changed.connect(p)}))}}}}]);