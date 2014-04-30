## Description

Sexycharts is a JavaScript extension for Google Charts. For now, it contains four kinds of charts: 

- Pie-chart
- Horizontal bar-chart
- Vertical bar-chart
- List of things with percantage

## Usage 
First thing you need to do use this charts is to setup all dependancies. There are 
- jQuery 
- Raphael.js
- Google Charts

All this files are in repository. So basicaly you need to add following lines to your html.
```html
	<link rel="stylesheet" type="text/css" href="index.css"/>
    <script type="text/javascript" src="http://www.google.com/jsapi"></script>
    <script src="jquery.js"></script>
    <script src="raphael.js"></script>
    <script src="sexychart.js"></script>
```
Next, you need to create some container for your chart. Let's create chart for our development cycle. Then add following div to html:
```html 
	<div id="development-cycle" style="width: 300px; height: 300px; margin-left: 35px;"></div>
```
And setup Google charts by adding following JavaScript code.:
```html
   <script type="text/javascript">
      // Setup Google Charts
      google.load("visualization", "1", {packages: ['table']});
      google.setOnLoadCallback(drawChart);

      function drawChart() {
		// Now we will write all our code here 
      }

    </script>
```
Now lets add some data and draw our chart.
```javascript
function drawChart() {
  // Create storage for our data
  var data = new google.visualization.DataTable();
  
  // Add data
  data.addColumn('string', 'Label');
  data.addColumn('number', 'Value');
  data.addColumn('string', 'Color')
  data.addRows([
    ['Eating cookies', 15.3, '#ADD7B8'],
    ['Playing table tennis', 17.3, '#88FFC4'],
    ['Thinking about stuff', 1.3, '#00E397'],
    ['Coding', 20.3, '#71C499'],
  ]);
  
  // Set options for chart
  var options = {measure: "Hours",
                 textAttr: {'font-size': 40,
                            'font-family':'Verdana, Verdana, sans-serif',
                            'fill': '#ADD7B8'}}; // font color
  
  // Draw chart
  chart = new sexychart.PieChart(document.getElementById('development-cycle'));
  chart.draw(data, options);
}
```

Here is what we have now:

Awesome, isn't it? Saddly, we don't see any labels. That's why we have a `sexychart.Legend` for it!
So lets add it to our chart. This is quite simple.

We add container to html. 
```html 
	<div id="development-legend" style="width: 600px; height: 80px;"></div>
```
And add following js to the end of our `drawChart()` function:
```javascript
  // Initialize legend
  var legend = new sexychart.Legend(document.getElementById('development-legend'));

  // Draw legend
  legend.draw(data, null);

  // Setup highlighting on hover
  google.visualization.events.addListener(chart, 'hover', function() {
    legend.setHover(chart.getHover());
  });

  google.visualization.events.addListener(legend, 'hover', function() {
    chart.setHover(legend.getHover());
  });
```
Here is the final result:


There more examples in of usage other charts in `index.html` file.

Enjoy!








