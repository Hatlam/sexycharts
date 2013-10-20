function donutChart(x, y, r1, r2, data, colors, placeholder) {

	var paper = Raphael(placeholder);
	var sectorSize = 1;
	var paths = paper.set();
	//var data = [5, 1, 5, 3];
	var startAngles = [];
	var endAngles = [];
	//var colors = ["#ADD7B8", "#88FFC4", "#00E397", "#71C499"];
	var total = 0;
	for (var i = 0; i < data.length; i++) {
		total += data[i];
		startAngles.push(0);
		endAngles.push(0);
	};
	var startAngle = 0;

	paper.ca.sector = function (x, y, r1, r2, startAngle, endAngle) {
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

			return {path: pathList};
		}


	for (var i = 0; i < data.length; i++) {
		var deltaAngle = data[i] / total * Math.PI * 2 * 0.0001;
		paths.push(paper.path().attr( {sector : [x, y, r1, r2, startAngle, startAngle + deltaAngle], fill: colors[i], stroke: colors[i], "stroke-width": 0}));
		startAngle += deltaAngle;
	};

	var shadows = paper.set();
	function redrawWithAnimation(ms) {
	 	var startAngle = 0;
	 	var deltaAngle = 0;

	 	for (var i = 0; i < data.length; i++) {
			var deltaAngle = data[i] / total * Math.PI * 2;
			var p = paths[i];
			p.animate({sector : [x, y, r1, r2, startAngle, startAngle + deltaAngle]}, ms, "bounce", function() {
				setAnimation(100);		
			});
			startAngles[i] = startAngle;
			startAngle += deltaAngle;
			endAngles[i] = startAngle;
		};

	}

	function setAnimation(ms) {
		for (var i = 0; i < paths.length; i++) {
			var p = paths[i];
			shadows.push(paths[i].glow({opacity: 0.0001, width: 30 * 0.6}));
			paths[i].data = i;
			p.mouseover(function () {
				this.stop().animate({"stroke-width": 30 * 0.33}, ms);
				shadows[this.data].stop().animate({opacity: 0.02}, ms);
				shadows[this.data].toFront();
				this.toFront();
			}).mouseout(function () {
				this.stop().animate({"stroke-width": 0}, 100);
				shadows[this.data].stop().animate({opacity: 0.0001}, ms);
				this.toBack();
				shadows[this.data].toBack();
				puttAllSectorsToFront();
			});
		};
	}

	function puttAllSectorsToFront() {
		for (var i = 0; i < paths.length; i++) {
			paths[i].toFront();
		};
	}

	function isScrolledIntoView(elem)
	{
	    var windowBottom = $(window).scrollTop() + window.innerHeight;
	    var windowTop = $(window).scrollTop();
	    var elemCenter = $(elem).offset().top + $(elem).height() / 2;
	    console.log(placeholder);
	    console.log(windowBottom);
	    console.log(windowTop);
	    console.log(elemCenter);
	    return elemCenter < windowBottom && elemCenter > windowTop;
	}

	var animationAllowed = true;
	if (isScrolledIntoView("#" + placeholder) && animationAllowed) {
		console.log("hm ;(");
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