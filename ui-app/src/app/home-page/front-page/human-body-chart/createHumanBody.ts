/* @flow */

import * as d3 from 'd3';

import RawSvg from './humanBodySVG';

import colorCodes from './humanBodyColorCodes';

import { HumanBody } from './humanBodyInterface';

const toClassName = key => key.split(' ').join('-').split(',').join('');
const halfPixel = 0.5;

//@@@PDC-1214 - Replace the sunburst chart with the human body image with drill down
//@@@PDC-1333: Mouse tooltip remains after moving off bar in human body image
//@@@PDC-2021: add major primary site feature
type TCreateHumanBody = (c: HumanBody) => void;
// Look for image map from GDC for the human graphic to allow filtering
// This file is reused From @oncojs/sapien package used in GDC portal.
// Creates human body image with organs and handles organ to bar chart mapping.
const createHumanBody: TCreateHumanBody = ({
  clickHandler,
  mouseOverHandler,
  mouseOutHandler,
  data,
  selector,
  height,
  width,
  labelSize,
  tickInterval,
  title = 'Cases by Primary Site',
  offsetLeft = 0,
  offsetTop = 0,
  primarySiteKey = '_key',
  caseCountKey = '_count',
  primarySitesFilters = '_primary_sites_filters',
  selectedHumanBodyOrgans,
  numberofOrgansFromAPI
} = {}) => {
  // Similar to a React target element
  console.log(data);
  const root = document.querySelector(selector);

  // if (!root) {
  //   throw 'Must select an existing element!';
  // }

  root.innerHTML = RawSvg({ height, width, title });

  width = 450;
  height = 450;
  labelSize = labelSize || '16px';
  tickInterval = tickInterval || 10;

  const plotHeight = height - 20;
  const barStartOffset = 110;
  const barWidth = width - barStartOffset;
  const maxCases = Math.max(...data.map(d => d[caseCountKey]));
  const numberOfVerticalAxis = Math.floor(maxCases / tickInterval) + 1;
  //Number of organs returned by the API + 1 ("Other") - currently hiding Other: PDC-1590
  const numberofOrgans = numberofOrgansFromAPI + 1;
  //const numberofOrgans = numberofOrgansFromAPI;
  var isorganSelected = false;
  var viewBoxHeight = height + 50;
  var viewBoxWidth = width + 150;

  // The Bar Chart
  //.attr('viewBox', `0 0 ${width} ${height}`)
  //.attr('width', width)
  const svg = d3
    .select(selector)
    .append('svg')
    .attr('class', 'chart')
    .attr('width', '450')
    .attr('height', '450')
    .attr('viewBox', `-110 -30 ${viewBoxWidth} ${viewBoxHeight}`)
	.attr('style', 'position:relative;left:200px')
    .append('g');

  // Move 'Not Reported' to bottom of bar graph with human body map
  /*if (data.length > 0) {
    var dataofOther = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i]._key == 'Not Reported') {
        //data[i]._key = "Other";
        dataofOther = data[i];
        data.splice(i, 1);
      }
    }
	//@@@PDC-1590 remove Other label from human body image
    //if (dataofOther != '') data.push(dataofOther);
  }*/
 
  //Redraw filter charts on datasets and home pages upon filter selection
  //Display text if there is no data
  if (data.length == 0) {
    svg.append("text")
    .attr('x', width/3)
    .attr('y', width/2)
    .attr('dy', '.35em')
    .text('No Data to Display');
  } 

  // Bar Heights
  const y = d3
    .scaleBand()
    .domain(data.map(x => x[primarySiteKey]))
    .range([plotHeight, 0]);
    
  // Bar Widths
  const x = d3
    .scaleLinear()
    .domain([0, maxCases])
    .range([0, barWidth]);

  //Horizontal Axis
  //Redraw filter charts on datasets and home pages upon filter selection
  //Display x-axis only if there's data
  if (data.length > 0) {
    svg
      .append('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.8)')
      .attr('x1', barStartOffset)
      .attr('x2', width)
      .attr('y1', plotHeight + halfPixel)
      .attr('y2', plotHeight + halfPixel);
  }
  
    console.log(data);

  const xAxisLabels = svg.append('g').attr('id', 'xAxisLabels');

  // Vertical Axis
  for (let i = 0; i < numberOfVerticalAxis; i++) {
    svg
      .append('line')
      .attr('stroke', `rgba(255, 255, 255, 0.${8 - i})`)
      .attr('x1', (x(tickInterval) * i) + barStartOffset)
      .attr('x2', (x(tickInterval) * i) + barStartOffset)
      .attr('y1', 0)
      .attr('y2', plotHeight);

    if (i) { // Don't display zero
      xAxisLabels
        .append('text')
        .attr('y', plotHeight + 13 + 5)
        .attr('x', (x(tickInterval) * i) + barStartOffset)
        .attr('fill', 'white')
        .attr('font-size', '18px')
        .style('text-anchor', 'middle')
        .text(d => (tickInterval * i).toLocaleString());
    }
  }

  //@@@PDC-1417: For the human body chart, add label to the X-axis
  xAxisLabels.append("text")
    .attr("x", barStartOffset + 51)
    .attr("y", plotHeight + 13 + 40)
    .attr('fill', 'white')
    .attr('font-size', '14px')
    .style('text-anchor', 'middle')
    .text("Number of Cases");

   // Primary Site Labels
   svg
   .append('g')
   .attr('id', 'primarySiteLabels')
   .selectAll('text')
   .data(data)
   .enter()
   .append('text')
   .attr('class', d => `primary-site-label-${toClassName(d[primarySiteKey])}`)
   .attr('y', (d, i) => ((plotHeight / (numberofOrgans-1)) * i) + 14 + 4)
   .attr('x', barStartOffset - 10)
   .attr('fill', 'white')
   .attr('font-size', '18px')
   .attr('font-weight', 500)
   .style('text-anchor', 'end')
   .text(d => d[primarySiteKey])
   .attr('onload', function (d,i):boolean {
    // If an organ is highlighted, highlight the corresponding label on load.
	console.log(selectedHumanBodyOrgans);
    if (selectedHumanBodyOrgans != '') {
      d3.select('.primary-site-label-' + selectedHumanBodyOrgans)
      .transition()
      .attr('fill', '#66FF66'); 
    }
	return true;
   })
   .on('mouseover', function (d, i) { // needs `this`
   const organSelector = toClassName(d[primarySiteKey]);
   const organ = document.getElementById(organSelector);
   console.log(organ);
   if (organ) {
    organ.setAttribute("style","opacity: 1 !important");
   }

   d3.select(this)
     .style('cursor', 'pointer');

   d3.select(`.bar-${toClassName(d[primarySiteKey])}`)
     .transition()
     .attr('fill', f => {
       const hsl = d3.hsl(f['color']);
       hsl.s = 1;
       hsl.l = 0.7;
       return String(d3.hsl(hsl));
     })
      .attr('stroke', f => {
          return '#66FF66';
      })
      .attr('stroke-width', f => {
        return '2px';
      }); 

   d3.select(`.primary-site-label-${toClassName(d[primarySiteKey])}`)
     .transition()
     .attr('fill', '#66FF66');

    if (mouseOverHandler) {
       mouseOverHandler(d);
    } else {
      var tooltipLabelPostfix = d['_count'] > 1 ? 'cases': 'case';
       tooltip
         .style('opacity', 1)
         .html(`
           <div style="color: #bb0e3d; white-space: nowrap;">${d['_key']}</div>
           <div style="font-size: 12px; color:  #141414">
             ${d['_count']} ${tooltipLabelPostfix}
           </div>
         `)
		 .style('position', 'absolute')
         .style('left', `${d3.event.pageX - offsetLeft - 200}px`)
         .style('top', `${d3.event.pageY - offsetTop - 400}px`)
         .style('transform', 'translateX(-50%)')
         .style('transform', 'translateX(-50%)')
         .style('z-index', '99999');
     }

 })
 .on('mouseout', (d, i) => { // needs `this`
 const organSelector = toClassName(d[primarySiteKey]);
 const organ = document.getElementById(organSelector);
 //@@@PDC-1333: Mouse tooltip remains after moving off bar in human body image
 var primaryKey = d[primarySiteKey];
 primaryKey = primaryKey.replace(',', '');
 primaryKey = primaryKey.replace(/ /g,"-");
 //Change so all bars still show in body map graph when a bar is selected
 if ((organ && selectedHumanBodyOrgans != organ.id) || (organSelector == "Other") || (selectedHumanBodyOrgans == "Other" && organSelector == selectedHumanBodyOrgans)) {
  if (organ) {
    organ.style.opacity = '0';
  }
  d3.select(`.bar-${primaryKey}`)
  .transition()
  .attr('fill', f => f['color'])
  .attr('stroke', f => {return '';});

  d3.select(`.primary-site-label-${toClassName(d[primarySiteKey])}`)
  .transition()
  .attr('fill', 'white');
}
//special case if the selected bar element is "Organ"
console.log(organSelector);
console.log(selectedHumanBodyOrgans);
if (selectedHumanBodyOrgans == "Other" && organSelector == selectedHumanBodyOrgans) {
  d3.select(`.bar-Other`)
  .attr('cursor', 'pointer')
  .transition()
  .attr('fill', f => {
    const hsl = d3.hsl(f['color']);
    hsl.s = 1;
    hsl.l = 0.7;
    return String(d3.hsl(hsl));
  })
  .attr('stroke', f => {
      return '#66FF66';
  })
  .attr('stroke-width', f => {
    return '2px';
  }); 
  //@@@PDC-1333: Mouse tooltip remains after moving off bar in human body image
  d3.select(`.primary-site-label-Other`)
  .transition()
  .attr('fill', '#66FF66');
}
tooltip.style('opacity', 0);
})
.on('click', (d,i) => {
  clickHandler({ _key: d[primarySitesFilters] });
  selectedHumanBodyOrgans = d[primarySiteKey];
  const svgs = document.querySelectorAll('#human-body-highlights svg');
  console.log(svgs);
  //Change so all bars still show in body map graph when a bar is selected
  //Do not highlight previously selected organs,bar graph,labels
 svgs.forEach.call(svgs, svgPart => {
      if (svgPart.id != d[primarySiteKey]) {
      svgPart.style.opacity = '0';
    } 
    d3.select(`.bar-${svgPart.id}`)
    .transition()
    .attr('fill', d => {
      d['color'] = colorCodes[d[primarySiteKey]]; return d['color'];
    })
    .attr('stroke', f => {return '';}); 
    d3.select(`.primary-site-label-${svgPart.id}`)
    .transition()
    .attr('fill', 'white');
  });
  //Deselect 'Other' part along with other organs.
  d3.select(`.bar-Other`)
  .transition()
  .attr('fill', d => {
    d['color'] = colorCodes[d[primarySiteKey]]; return d['color'];
  })
  .attr('stroke', f => {return '';});
  d3.select(`.primary-site-label-Other`)
  .transition()
  .attr('fill', 'white');
   const organSelector = toClassName(d[primarySiteKey]);
  const organ = document.getElementById(organSelector);
  if (organ) {
    organ.setAttribute( 'style', 'opacity: 1 !important');
  }
  d3.select(`.bar-${d[primarySiteKey]}`)
  .transition()
  .attr('fill', f => {
    const hsl = d3.hsl(f['color']);
    hsl.s = 1;
    hsl.l = 0.7;
    return String(d3.hsl(hsl));
  })
  .attr('stroke', f => {
      return '#66FF66';
  })
  .attr('stroke-width', f => {
    return '2px';
  }); 
  d3.select(`.primary-site-label-${toClassName(d[primarySiteKey])}`)
  .transition()
  .attr('fill', '#66FF66'); 
});


  // Bar Chart Tootlip
  const tooltip = d3
    .select(selector)
    .append('div')
    .style('white-space', 'nowrap')
    .style('position', 'absolute')
    //.style('opacity', 0)
    .style('background-color', 'white')
    .style('padding', '6px')
    .style('box-shadow', '0 2px 5px 0 rgba(0,0,0,0.16),0 2px 10px 0 rgba(0,0,0,0.12)')
    .style('border-radius', '5px')
    .style('border', '1px solid rgba(40, 40, 40)')
    .style('pointer-events', 'none');

  if (data.length == 0) {
    tooltip.style('opacity', 0);
  }

  // Horizontal Bars
  svg
    .append('g')
    .attr('id', 'barGroup')
    .selectAll('g')
    .data(data)
	.enter()
    .append('g')
    .append('rect')
    .attr('class', d => `bar-group-${toClassName(d[primarySiteKey])}`)
    .attr('y', function(d, i) { 
      return ((plotHeight / (numberofOrgans-1)) * i) + 6;
    })
    .attr('x', barStartOffset + halfPixel)
    .attr('width', d => x(d[caseCountKey]))
    .attr('height', 22)
    .attr('fill', (d, i) => { 
        d['color'] = colorCodes[d[primarySiteKey]]; 
		return d['color']; 
    })
    .attr('class', d => `bar-${toClassName(d[primarySiteKey])}`)
    .attr('onload', function (d,i):boolean {
      tooltip.style('opacity', 0);
      // If an organ is highlighted, highlight the corresponding bar on load.
      if (selectedHumanBodyOrgans != '') {
        d3.select('.bar-'+selectedHumanBodyOrgans)
        .attr('cursor', 'pointer')
        .transition()
        .attr('fill', f => {
          const hsl = d3.hsl(f['color']);
          hsl.s = 1;
          hsl.l = 0.7;
          return String(d3.hsl(hsl));
        })
        .attr('stroke', f => {
           return '#66FF66';
        })
        .attr('stroke-width', f => {
          return '2px';
        }); 
      }
	  return true;
    })
    .on('mouseover', function (d, i) { // needs `this`
	console.log(d);
    const organSelector = toClassName(d[primarySiteKey]);
    const organ = document.getElementById(organSelector);
    if (organ) {
      organ.setAttribute( 'style', 'opacity: 1 !important');
    }

    d3.select(this)
      .attr('cursor', 'pointer')
      .transition()
      .attr('fill', f => {
        const hsl = d3.hsl(f['color']);
        hsl.s = 1;
        hsl.l = 0.7;
        return String(d3.hsl(hsl))
      })
      .attr('stroke', f => {
          return '#66FF66';
      })
      .attr('stroke-width', f => {
        return '2px';
      }); 

    d3.select(`.primary-site-label-${toClassName(d[primarySiteKey])}`)
      .transition()
      .attr('fill', '#66FF66');

    if (mouseOverHandler) {
      mouseOverHandler(d);
    } else {
      var tooltipLabelPostfix = d['_count'] > 1 ? 'cases': 'case';      
      tooltip
        .style('opacity', 1)
        .html(`
          <div style="color: #bb0e3d; white-space: nowrap">${d['_key']}</div>
          <div style="font-size: 12px; color:  #141414">
            ${d['_count'].toLocaleString()} ${tooltipLabelPostfix}
          </div>
        `)
		.style('position', 'absolute')
        .style('left', `${d3.event.pageX -  offsetLeft - 200}px`)
        .style('top', `${d3.event.pageY - offsetTop - 400 }px`)
        .style('transform', 'translateX(-50%)')
        .style('transform', 'translateX(-50%)')
        .style('z-index', '99999');
    }
  })
  .on('click', function (d, i) {
    clickHandler({ _key: d[primarySitesFilters] }); //Send filters rather than organ name
    selectedHumanBodyOrgans = d[primarySiteKey];
	console.log(selectedHumanBodyOrgans);
    const svgs = document.querySelectorAll('#human-body-highlights svg');
	console.log(svgs);
    //Change so all bars still show in body map graph when a bar is selected
    //Do not highlight previously selected organs,bar graph,labels
    svgs.forEach.call(svgs, svgPart => {
        if (svgPart.id != this.id) {
        svgPart.style.opacity = '0';
      }     
      d3.select(`.bar-${svgPart.id}`)
      .transition()
      .attr('fill', d => {
        d['color'] = colorCodes[d[primarySiteKey]]; return d['color'];
      })
      .attr('stroke', f => {return '';}); 
      d3.select(`.primary-site-label-${svgPart.id}`)
      .transition()
      .attr('fill', 'white');
      
    });
    //Deselect 'Other' part along with other organs.
    d3.select(`.bar-Other`)
    .transition()
    .attr('fill', d => {
      d['color'] = colorCodes[d[primarySiteKey]]; return d['color'];
    })
    .attr('stroke', f => {return '';});
    d3.select(`.primary-site-label-Other`)
    .transition()
    .attr('fill', 'white');
    //Highlight selected organs,bar graph,labels
    const organSelector = toClassName(d[primarySiteKey]);
    const organ = document.getElementById(organSelector);
    if (organ) {
      organ.setAttribute( 'style', 'opacity: 1 !important');
    }
    d3.select(this)
    .attr('cursor', 'pointer')
    .transition()
    .attr('fill', f => {
      const hsl = d3.hsl(f['color']);
      hsl.s = 1;
      hsl.l = 0.7;
      return String(d3.hsl(hsl));
    })
    .attr('stroke', f => {
        return '#66FF66';
    })
    .attr('stroke-width', f => {
      return '2px';
    }); 
    d3.select(`.primary-site-label-${toClassName(d[primarySiteKey])}`)
    .transition()
    .attr('fill', '#66FF66');
  })
  .on('mouseout', function (d, i) { // needs `this`
    const organSelector = toClassName(d[primarySiteKey]);
    const organ = document.getElementById(organSelector);
    //Have human body map stay highlighted after selection
    //Change so all bars still show in body map graph when a bar is selected
    if ((organ && selectedHumanBodyOrgans != organ.id) || (organSelector == "Other") || (selectedHumanBodyOrgans == "Other" && organSelector == selectedHumanBodyOrgans)) {
      if (organ) {
        organ.style.opacity = '0';
      }
      d3.select(this)
      .transition()
      .attr('fill', f => f['color'])
      .attr('stroke', f => {return '';});
      d3.select(`.primary-site-label-${toClassName(d[primarySiteKey])}`)
      .transition()
      .attr('fill', '#66FF66');
    }
    //Change so all bars still show in body map graph when a bar is selected
    //special case if the selected bar element is "Organ"
    if (selectedHumanBodyOrgans == "Other" && organSelector == selectedHumanBodyOrgans) {
      d3.select(this)
      .attr('cursor', 'pointer')
      .transition()
      .attr('fill', f => {
        const hsl = d3.hsl(f['color']);
        hsl.s = 1;
        hsl.l = 0.7;
        return String(d3.hsl(hsl));
      })
      .attr('stroke', f => {
          return '#66FF66';
      })
      .attr('stroke-width', f => {
        return '2px';
      }); 
    }
    if ((organ && selectedHumanBodyOrgans != organ.id) || (organSelector == "Other" && organSelector != selectedHumanBodyOrgans)) {
      d3.select(`.primary-site-label-${toClassName(d[primarySiteKey])}`)
      .transition()
      .attr('fill', 'white');
    }

    if (mouseOutHandler) {
      mouseOutHandler(d);
    } else {
      tooltip.style('opacity', 0);
    }
  });

  const svgs = document.querySelectorAll('#human-body-highlights svg');
  svgs.forEach.call(svgs, svgPart => {
    svgPart.addEventListener('click', function () {
	  //clickHandler({ _key: this.id }); //this.id will return incorrect primary site in case of primary site with non alphanumeric characters
	  //PDC-1231
	  //In order to filter by primary site have to use the correct primary site name which might include spaces and commas
	  // svg id is not allowed to use commas and spaces, therefore, need to move to corresponding bar in the bar chart
	  // and get the apropriate primary site name from the bar data.
		d3.select(`.bar-${svgPart.id}`)
        .transition()
        .attr('fill', d => {
			console.log(d[primarySitesFilters]);
			clickHandler({ _key: d[primarySitesFilters] }); //calling to clickHandler function with the correct primary site name
			d['color'] = colorCodes[d[primarySiteKey]]; 
			return d['color'];
		});
      //Have human body map stay highlighted after selection
      //Change so all bars still show in body map graph when a bar is selected
      //Do not highlight previously selected organs,bar graph,labels
      svgs.forEach.call(svgs, svgPart => {
        if (svgPart.id != this.id) {
          svgPart.style.opacity = '0';
        }
        d3.select(`.bar-${svgPart.id}`)
        .transition()
        .attr('fill', d => {
          d['color'] = colorCodes[d[primarySiteKey]]; return d['color'];
        })
        .attr('stroke', f => {return '';});
        d3.select(`.primary-site-label-${svgPart.id}`)
        .transition()
        .attr('fill', 'white');
      });
      //Deselect 'Other' part along with other organs.
      d3.select(`.bar-Other`)
      .transition()
      .attr('fill', d => {
        d['color'] = colorCodes[d[primarySiteKey]]; return d['color'];
      })
      .attr('stroke', f => {return '';});
      d3.select(`.primary-site-label-Other`)
      .transition()
      .attr('fill', 'white');     
      //Highlight selected organs,bar graph,labels
      this.style.opacity = '1 !important';
      selectedHumanBodyOrgans = this.id;
      this.isorganSelected = this.id;
      d3.select(`.bar-${this.id}`)
        .transition()
        .attr('fill', d => {
          const hsl = d3.hsl(d['color']);
          hsl.s = 1;
          hsl.l = 0.7;
          return String(d3.hsl(hsl));
        })
        .attr('stroke', f => {
            return '#66FF66';
        })
        .attr('stroke-width', f => {
          return '2px';
        }); 
        d3.select(`.primary-site-label-${toClassName(this.id)}`)
        .transition()
        .attr('fill', '#66FF66');


    });

    svgPart.addEventListener('mouseover', function (event) { // needs `this`
	  this.setAttribute( 'style', 'opacity: 1 !important');
	
      d3.select(`.primary-site-label-${this.id}`)
        .transition()
        .attr('fill', '#66FF66');

      d3.select(`.bar-${this.id}`)
        .attr('cursor', 'pointer')
        .transition()
        .attr('fill', d => {
          // hacks
          if (mouseOverHandler) {
            mouseOverHandler(d);
          } else {
            var tooltipLabelPostfix = d['_count']>1 ? 'cases': 'case';
            tooltip
              .style('opacity', 1)
              .html(`
                <div style="color: #bb0e3d; white-space: nowrap">${d[primarySiteKey]}</div>
                <div style="font-size: 12px; color:  #141414">
                  ${d['_count'].toLocaleString()} ${tooltipLabelPostfix}
                </div>
              `)
              .style('left', `${event.clientX - offsetLeft + 30}px`)
              .style('top', `${event.clientY - offsetTop + 30 }px`)
              .style('transform', 'translateX(-50%)')
              .style('z-index', '99999');
          }

          const hsl = d3.hsl(d['color']);
          hsl.s = 1;
          hsl.l = 0.7;
          return String(d3.hsl(hsl));
        })
        .attr('stroke', f => {
            return '#66FF66';
        })
        .attr('stroke-width', f => {
          return '2px';
        }); 
    });

    svgPart.addEventListener('mouseout', function () { // needs `this`
    //Have human body map stay highlighted after selection
     if (selectedHumanBodyOrgans != svgPart.id) {
        this.style.opacity = '0';
     }
    if (this.isorganSelected == svgPart.id) {
        d3.select(`.primary-site-label-${toClassName(this.id)}`)
        .transition()
        .attr('fill', '#66FF66');
      } else {
      d3.select(`.primary-site-label-${this.id}`)
        .transition()
        .attr('fill', 'white');
      }
      d3.select(`.bar-${this.id}`)
        .transition()
        .attr('fill', d => {
          if (mouseOutHandler) {
            mouseOutHandler(d);
          } else {
            tooltip.style('opacity', 0);
          } 
          //Change so all bars still show in body map graph when a bar is selected
          if (this.isorganSelected == this.id) {
              const hsl = d3.hsl(d['color']);
              hsl.s = 1;
              hsl.l = 0.7;
              return d3.hsl(hsl);
          } else {
            return d['color'];
          }
        })
        .attr('stroke', f => {
          if (this.isorganSelected == this.id) {
            return '#66FF66';
          } else {
            return '';
          }
        })
        .attr('stroke-width', f => {
          if (this.isorganSelected == this.id) {
            return '2px';
          } else {
            return '';
          }
        });
    });
    // Have human body map stay highlighted after selection
    // if the filter contains human body organ, keep it highlighted even when other filters are selected.
    if (selectedHumanBodyOrgans == svgPart.id) {
        if (data.length == 0) {
            svgPart.style = 'opacity: 0';
        } else {
            svgPart.style = 'opacity: 1 !important';
        }
    }
  });
};

export default createHumanBody;


export const HUMAN_BODY_SITES_MAP = {
  'accessory sinuses': 'Head and Neck',
  'adrenal gland': 'Adrenal Gland',
  'anus and anal canal': 'Other And Ill-Defined Sites',
  'base of tongue': 'Head and Neck',
  'bile duct': 'Bile Duct',
  bladder: 'Bladder',
  blood: 'Blood',
  'bone marrow': 'Bone Marrow',
  bone: 'Bone',
  'bones, joints and articular cartilage of limbs': 'Bone',
  'bones, joints and articular cartilage of other and unspecified sites':
    'Bone',
  brain: 'Brain',
  breast: 'Breast',
  'bronchus and lung': 'Lung',
  'cervix uteri': 'Cervix',
  cervix: 'Cervix',
  colon: 'Colon',
  colorectal: 'Colorectal',
  'connective, subcutaneous and other soft tissues': 'Soft Tissue',
  'corpus uteri': 'Uterus',
  esophagus: 'Esophagus',
  'eye and adnexa': 'Eye',
  eye: 'Eye',
  'floor of mouth': 'Head and Neck',
  gallbladder: 'Other And Ill-Defined Sites',
  gum: 'Head and Neck',
  'head and neck': 'Head and Neck',
  'heart, mediastinum, and pleura': 'Pleura',
  'hematopoietic and reticuloendothelial systems': 'Bone Marrow',
  hypopharynx: 'Head and Neck',
  kidney: 'Kidney',
  larynx: 'Head and Neck',
  lip: 'Head and Neck',
  'liver and intrahepatic bile ducts': 'Liver',
  liver: 'Liver',
  lung: 'Lung',
  'lymph nodes': 'Lymph Nodes',
  meninges: 'Other And Ill-Defined Sites',
  'nasal cavity and middle ear': 'Head and Neck',
  nasopharynx: 'Head and Neck',
  'nervous system': 'Nervous System',
  'not reported': 'Not Reported',
  oropharynx: 'Head and Neck',
  'other and ill-defined digestive organs': 'Other And Ill-Defined Sites',
  'other and ill-defined sites in lip, oral cavity and pharynx':
    'Head and Neck',
  'other and ill-defined sites within respiratory system and intrathoracic organs':
    'Other And Ill-Defined Sites',
  'other and ill-defined sites': 'Other And Ill-Defined Sites',
  'other and unspecified female genital organs': 'Other And Ill-Defined Sites',
  'other and unspecified major salivary glands': 'Head and Neck',
  'other and unspecified male genital organs': 'Other And Ill-Defined Sites',
  'other and unspecified parts of biliary tract': 'Bile Duct',
  'other and unspecified parts of mouth': 'Head and Neck',
  'other and unspecified parts of tongue': 'Head and Neck',
  'other and unspecified urinary organs': 'Other And Ill-Defined Sites',
  'other endocrine glands and related structures':
    'Other And Ill-Defined Sites',
  ovary: 'Ovary',
  palate: 'Head and Neck',
  pancreas: 'Pancreas',
  'parotid gland': 'Head and Neck',
  penis: 'Other And Ill-Defined Sites',
  'peripheral nerves and autonomic nervous system':
    'Other And Ill-Defined Sites',
  placenta: 'Other And Ill-Defined Sites',
  pleura: 'Pleura',
  'prostate gland': 'Prostate',
  prostate: 'Prostate',
  'pyriform sinus': 'Head and Neck',
  'rectosigmoid junction': 'Colorectal',
  rectum: 'Colorectal',
  'renal pelvis': 'Other And Ill-Defined Sites',
  'retroperitoneum and peritoneum': 'Other And Ill-Defined Sites',
  skin: 'Skin',
  'small intestine': 'Stomach',
  'soft tissue': 'Soft Tissue',
  'spinal cord, cranial nerves, and other parts of central nervous system':
    'Nervous System',
  stomach: 'Stomach',
  testis: 'Testis',
  thymus: 'Thymus',
  'thyroid gland': 'Thyroid',
  thyroid: 'Thyroid',
  tonsil: 'Head and Neck',
  trachea: 'Head and Neck',
  'unknown primary site': 'Other And Ill-Defined Sites',
  unknown: 'Not Reported',
  ureter: 'Other And Ill-Defined Sites',
  'uterus, nos': 'Uterus',
  'uterus nos': 'Uterus',
  uterus: 'Uterus',
  vagina: 'Other And Ill-Defined Sites',
  vulva: 'Other And Ill-Defined Sites',
};

export const HUMAN_BODY_ALL_ALLOWED_SITES = [
  'Adrenal Gland',
  'Bile Duct',
  'Bladder',
  'Blood',
  //'Bone',
  'Bone Marrow',
  'Brain',
  'Breast',
  'Cervix',
  'Colorectal',
  'Esophagus',
  'Eye',
  'Head and Neck',
  'Kidney',
  'Liver',
  'Lung',
  'Lymph Nodes',
  'Nervous System',
  'Ovary',
  'Pancreas',
  'Pleura',
  'Prostate',
  'Skin',
  'Soft Tissue',
  'Stomach',
  'Testis',
  'Thymus',
  'Thyroid',
  'Uterus',
  'Uterus NOS',
  'Bronchus and lung',
];