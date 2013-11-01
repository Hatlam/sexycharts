/*
    SexyChart.js visualistaions 

    Data format 
        First column string (label)
        Second column number (value)
        Third column string (color)

    Methods 
        getHover
        setHover

    Event 
        hover
*/

var sexychart = {};

/***********************************************
    Pie Chart visualisation
************************************************/

// Global constant to prevent collisions of different legends
sexychart.nextPieChartId = 0;

sexychart.DIV_TO_R1 = 12/36;
sexychart.DIV_TO_R2 = 15/36;
sexychart.DIV_TO_STROKE = 1/30;
sexychart.DIV_TO_SHADOW = 1/18;
sexychart.DIV_TO_TXT = 1/9;
sexychart.DIV_TO_TXTM = 1/16;

// PieChart constructor 
sexychart.PieChart = function (container) {
    // Stores comtainer HTML element
    this.containerElement = container;
    this.uid = sexychart.nextPieChartId++;
    this.selection = null;
    this.totalValue = 0;
    this.paths = [];
    this.txt = "";
    this.hasBeenAnimated = false;
    this.meassure = "";
    this.width = 0;
    this.height = 0;
    this.min = 0;
    this.textColor = "#000";
}

function sectorPath(x, y, r1, r2, startAngle, endAngle) {
    var x11 = x + r1 * Math.sin(startAngle);
    var y11 = y - r1 * Math.cos(startAngle);
    var x21 = x + r1 * Math.sin(endAngle);
    var y21 = y - r1 * Math.cos(endAngle);

    var x12 = x + r2 * Math.sin(startAngle);
    var y12 = y - r2 * Math.cos(startAngle);
    var x22 = x + r2 * Math.sin(endAngle);
    var y22 = y - r2 * Math.cos(endAngle);

    var big = 0;
    if (endAngle - startAngle > Math.PI) 
        big = 1;

    var pathList = ["M", x12, y12,
                    "A", r2, r2, 0, big, 1, x22, y22,
                    "L", x21, y21, 
                    "A", r1, r1, 0, big, 0, x11, y11,
                    "Z"];

    return pathList;
}

// PieChart.draw() method 
sexychart.PieChart.prototype.draw = function (data, options) {

    var self = this;

    Raphael.fn.donutChart = function (x, y, r1, r2, data, colors) {

        var paper = this;
        var sectorSize = 1;
        var paths = paper.set();
        var startAngles = [];
        var endAngles = [];
        var total = 0;
        var placeholder = this.canvas.parentNode.id;
        
        self.totalValue = 0;
        for (var i = 0; i < data.length; i++) {
            self.totalValue += data[i];
            startAngles.push(0);
            endAngles.push(0);
        };
        
        var startAngle = 0;
        total = self.totalValue;

        paper.ca.sector = function (x, y, r1, r2, startAngle, endAngle) {
            var pathList = sectorPath(x, y, r1, r2, startAngle, endAngle);
            return {path: pathList};
        }

        for (var i = 0; i < data.length; i++) {
            var deltaAngle = data[i] / total * Math.PI * 2 * 0.000001;
            self.paths.push(paper.path().attr( 
                        {sector : [x, y, r1, r2, startAngle, startAngle + deltaAngle], 
                        fill: colors[i], stroke: colors[i], 
                        "stroke-width": 0}));
            startAngle += deltaAngle;
        };

        function redrawWithAnimation(ms) {

            // First deal with shadows 
            var startAngle = 0;
            var deltaAngle = 0;
            for (var i = 0; i < data.length; i++) {
                var deltaAngle = data[i] / (total * 1.00001) * Math.PI * 2;
                var p = self.paths[i];
                var dStroke = (r2 - r1) * 0.22;
                var shadow = paper.path(sectorPath(x, y, r1 - dStroke, r2 + dStroke, startAngle - 0.04, startAngle + deltaAngle + 0.04));
                shadow.hide();
                p.shadow = shadow.glow({width: 5, color: 'black', opacity: 0.001});
                startAngles[i] = startAngle;
                startAngle += deltaAngle;
                endAngles[i] = startAngle;
            };

            // 
            startAngle = 0;
            deltaAngle = 0;
            for (var i = 0; i < data.length; i++) {
                var deltaAngle = data[i] / (total * 1.00001) * Math.PI * 2;
                var p = self.paths[i];
                p.value = data[i];
                p.formatedValue = data[i];
                p.animate({sector : [x, y, r1, r2, startAngle, startAngle + deltaAngle]}, ms, "bounce", function() {
                    setAnimation(100);
                    self.hasBeenAnimated = true;      
                });
                startAngles[i] = startAngle;
                startAngle += deltaAngle;
                endAngles[i] = startAngle;
            };

        }

        if (options && "textColor" in options) {
            self.textColor = options.textColor;
        }

        self.txt = paper.text(x, y - self.min * sexychart.DIV_TO_TXT / 6, self.formatValue(total)).attr(
                                                {'font-size': self.min * sexychart.DIV_TO_TXT, 
                                                'font-family':'Verdana, Verdana, sans-serif',
                                                'fill': self.textColor});

        if (options && "meassure" in options) {
            self.meassure = paper.text(x, y + self.min * sexychart.DIV_TO_TXT * .9, options.meassure)
                                .attr({'font-size': self.min * sexychart.DIV_TO_TXTM, 
                                        'font-family':'Verdana, Verdana, sans-serif',
                                        'fill': self.textColor});
        }
        


        var values = data;
        function setAnimation(ms) {
            for (var i = 0; i < self.paths.length; i++) {
                var p = self.paths[i];
                p.index = i;
                p.isSelected = false;
                p.mouseover(function () {
                    self.setHover([{row: this.index}]);
                    google.visualization.events.trigger(self, 'hover', {});
                }).mouseout(function () {
                    self.setHover([{row: null}]);
                    google.visualization.events.trigger(self, 'hover', {});
                });
            };
        }

        function puttAllSectorsToFront() {
            for (var i = 0; i < self.paths.length; i++) {
                self.paths[i].toFront();
            };
        }

        function isScrolledIntoView(elem)
        {
            var windowBottom = $(window).scrollTop() + window.innerHeight;
            var windowTop = $(window).scrollTop();
            var elemCenter = $(elem).offset().top + $(elem).height() / 2;
            return elemCenter < windowBottom && elemCenter > windowTop;
        }

        var animationAllowed = true;
        if (isScrolledIntoView("#" + placeholder) && animationAllowed) {
            redrawWithAnimation(1500);
            animationAllowed = false;
            puttAllSectorsToFront();
        }

        $(document).scroll( function(){
                if (isScrolledIntoView("#" + placeholder) && animationAllowed) {
                    redrawWithAnimation(1500);
                    animationAllowed = false;
                    puttAllSectorsToFront();
                }
        });
    };

    if ('width' in options && 'height' in options) {
        this.width = options.width;
        this.height = options.height;
    }
    else {
        this.width = this.containerElement.offsetWidth;
        this.height = this.containerElement.offsetWidth;   
    }

    this.min = Math.min(this.width, this.height);

    var r = Raphael(this.containerElement, this.width, this.height),
        colors = [],
        values = [],
        formattedVals = [];
    

    var amountOfColumns = data.getNumberOfColumns();
    var amountOfRows = data.getNumberOfRows();

    if (amountOfColumns  >= 3 
        && data.getColumnType(0) == 'string' 
        && data.getColumnType(1) == 'number'
        && data.getColumnType(2) == 'string')
    {
        for (var rowIndex = 0; rowIndex < amountOfRows; ++rowIndex) {
            values.push(data.getValue(rowIndex, 1));
            formattedVals.push(data.getFormattedValue(rowIndex, 1));
            colors.push(data.getValue(rowIndex, 2));
            
        }
    }
    else {
        // FIX
        console.log('Wrong table format!');
    }

    r.donutChart(this.width / 2, this.height / 2, 
                this.min * sexychart.DIV_TO_R1,
                this.min * sexychart.DIV_TO_R2, values, colors);

   for (var i = 0; i < this.paths.length; ++i) {
        this.paths[i].value = values[i];
        this.paths[i].formattedValue = formattedVals[i];
   } 
}

sexychart.PieChart.prototype.getHover = function () {
    return this.selection;
}

sexychart.PieChart.prototype.setHover = function (coords) {
    if ( !this.hasBeenAnimated )
        return;

    var r = (coords == null || coords.length < 1 || coords[0].row == null )  ? null : coords[0].row;
    this.selection = [{row: r}];

    for (var i = 0; i < this.paths.length; i++) {
        var curPath = this.paths[i];
        if (i == r && !this.paths[i].isSelected) {
            curPath.isSelected = true;
            curPath.stop().animate({"stroke-width": this.min * sexychart.DIV_TO_STROKE}, 100);
            curPath.shadow.stop().animate({opacity: 0.02}, 100);
            curPath.shadow.toFront();
            curPath.toFront();
            this.txt.attr({"text": this.formatValue(curPath.value)});
        }
        else if (i != r && this.paths[i].isSelected) {
            curPath.isSelected = false;
            curPath.stop().animate({"stroke-width": 0}, 100);
            curPath.shadow.stop().animate({opacity: 0.001}, 100);
            curPath.shadow.toBack();
            this.puttAllSectorsToFront();
            curPath.toFront();
            this.txt.attr({"text": this.formatValue(this.totalValue)});   
        }
    };
}

sexychart.PieChart.prototype.puttAllSectorsToFront = function () {
    for (var i = 0; i < this.paths.length; i++) {
        this.paths[i].toFront();
    };
}

sexychart.PieChart.prototype.formatValue = function (number) {
    n = Math.round(number * 10) / 10;
    return n.toString().replace('.', ',');
}

/***********************************************
    Legend table visualisation
************************************************/

// Global constant to prevent collisions of different legends
sexychart.nextLegendId = 0;

// Legend constructor 
sexychart.Legend = function (container) {
    // Stores comtainer HTML element
    this.containerElement = container;
    this.uid = sexychart.nextLegendId++;
    this.selection = -1;
    this.bars = [];
}

sexychart.Legend.prototype.escapeHtml = function(text) {
  if (text == null) {
    return '';
  }
  return text.replace(/&/g, '&amp;').
      replace(/</g, '&lt;').
      replace(/>/g, '&gt;').
      replace(/"/g, '&quot;');
};

sexychart.Legend.prototype.getBarById = function (id) {
    for (var i = 0; i < this.bars.length; i++) {
        if (this.bars[i].domId == id)
            return this.bars[i];
    };
}

// Legend.draw() method 
sexychart.Legend.prototype.draw = function (data, options) {
    // Add error processing

    // Set up html skeleton
    var html = [];
    var amountOfColumns = data.getNumberOfColumns();
    var amountOfRows = data.getNumberOfRows();
    var bars = this.bars;

    if (amountOfColumns  >= 3 
        && data.getColumnType(0) == 'string' 
        && data.getColumnType(1) == 'number'
        && data.getColumnType(2) == 'string')
    {
        var totalValue = 0;
        for (var rowIndex = 0; rowIndex < amountOfRows; ++rowIndex) {
            totalValue += data.getValue(rowIndex, 1);
        }



        // Setting up bar array
        for (var rowIndex = 0; rowIndex < amountOfRows; ++rowIndex) {
            bars.push({label: data.getValue(rowIndex, 0), 
                       value: data.getValue(rowIndex, 1),
                       color: data.getValue(rowIndex, 2),
                       index: rowIndex,
                       domId: "legend-" + this.uid + "-item-" + rowIndex});
        }

        // Drawing
        html.push('<ul class="legend-' + this.uid + '">');
        for (var i = 0; i < bars.length; ++i) {
            html.push('<li id="' + bars[i].domId + '">');
            html.push('<div style="background-color:'+ bars[i].color +';"></div>');
            html.push('<p>' + bars[i].label + '</p>');
            html.push('<span style="color:'+ bars[i].color +';">'
                        + Math.round((bars[i].value / totalValue) * 100)
                        + '% </span>');
            html.push('</li>');
        }
        html.push('</ul>');
    }
    else {
        // FIX
        console.log('Wrong table format!');
    }

    this.containerElement.innerHTML = html.join('');

    // Draw the current selection
    this.setHover(this.selection);

    // Attach event handlers if clickable
    for (var i = 0; i < bars.length; i++) {
        var bar = bars[i];
        var b = document.getElementById(bar.domId);
        b.style.cursor = 'pointer';
        var self = this;
    
        $(b).hover( function () {
            self.setHover([{row:self.getBarById($(this).attr('id')).index, col:0}]);
            google.visualization.events.trigger(self, 'hover', {});
        }, function () {
            self.setHover([{row:null, col:null}]);
            google.visualization.events.trigger(self, 'hover', {});
        });
    }  
}

sexychart.Legend.prototype.getHover = function() {
    return this.selection;
};

sexychart.Legend.prototype.setHover = function (coords) {
    if (!coords) {
        coords = [];
    }

    this.selection = coords;

    var bars = this.bars;
    for (var i = 0; i < bars.length; i++) {
        var bar = bars[i];
        var className = 'legend-item';
        for (var c = 0; c < coords.length; c++) {
            var rowInd = coords[c].row;
            var colInd = coords[c].col;
            if (rowInd != null && bar.index == rowInd) {
                className += '-hover';
                break;
            }  
        }

        var td = document.getElementById(bar.domId);
        if (td.className != className) {
            td.className = className;
        }
    }
}

