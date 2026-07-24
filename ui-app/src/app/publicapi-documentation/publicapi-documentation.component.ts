import { AfterViewInit, Component, OnInit, ViewEncapsulation,Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';



import * as $ from 'jquery';

declare const SwaggerUi: any;
declare const spec: any;
declare const hljs: any;
declare const initOAuth: any;
declare const SwaggerClient: any;
declare var $ : any;

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-publicapi-documentation',
    templateUrl: './publicapi-documentation.component.html',
    styleUrls: ["../../assets/css/publicapi-documentation/index.css",
        "../../assets/css/publicapi-documentation/main.css",
        "../../assets/css/publicapi-documentation/standalone.css",
        "../../assets/css/publicapi-documentation/api-explorer.css",
        "../../assets/css/publicapi-documentation/screen.css",
        "../../assets/css/publicapi-documentation/search.css",
        './publicapi-documentation.component.css'],
    providers: [
    //  { provide: Window, useValue: window }
    ],
    standalone: false
})


export class PublicapiDocumentationComponent implements AfterViewInit  {
  ui;
  v;
  u;
  private window: Window;


  //constructor(private window: Window) {
  constructor(@Inject(DOCUMENT) private document: Document) {
    this.window = this.document.defaultView;

  }

  ngOnInit() {}

  ngAfterViewInit() {

    // @@@PDC-6401 get proper document url
    let swUrl = '/pdc/publicapi-documentation';
    const ui = new SwaggerUi({
      url: swUrl,

      dom_id: 'swagger-ui-container',
      spec: spec,
      deepLinking: false,

      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
      onComplete: function (swaggerApi, swaggerUi) {

        if (typeof initOAuth == "function") {

          initOAuth({
            clientId: "ffe7748a-3a3f-4860-a02a-42ab08e4fde2",
            realm: "realm",
            appName: "Swagger"
          });

        }

        $('pre code').each(function (i, e) {
          hljs.highlightBlock(e)
        });



        if (swaggerUi.options.url) {

          $('#input_baseUrl').val(swaggerUi.options.url);
        }
        if (swaggerUi.options.apiKey) {
          $('#input_apiKey').val(swaggerUi.options.apiKey);
        }



        /* @@@PDC-2179: Add search feature in Swagger API Documentation */

        var searchTemplate = "<div class='filter'><fieldset class='search'><legend class='sr-only'>Search API Methods</legend><label for='api-search-input' class='sr-only'>Search for API methods</label><input id='api-search-input' type='text' placeholder='Search for API methods... ' aria-label='Search for API methods'><button type='submit' aria-label='Search'><i class='icon-search'></i></button></fieldset></div>";

        $("#swagger-ui-container").find(">div>ul").sieve({
          itemSelector: "li",
          searchTemplate: searchTemplate
        });


        //$("#swagger-ui-container").find(">div>ul").css("background-color", "yellow");

        $(".filter input").on("keypress", function() {
          $("#resources > li > ul.endpoints").show();
        });

        $("[data-toggle='tooltip']").tooltip();

        /* Add accessibility labels for 508 compliance */
        // Function to add aria-label to form inputs
        function addAccessibilityLabels() {
          $('input.parameter, textarea.parameter, select.parameter, input.body-textarea, textarea.body-textarea').each(function() {
            var $input = $(this);
            var name = $input.attr('name');
            var title = $input.attr('data-original-title') || $input.attr('title') || name;
            
            // Set aria-label if not already set
            if (!$input.attr('aria-label') && title) {
              $input.attr('aria-label', title);
            }
          });
          
          // Add labels to URL and API Key inputs
          if ($('#input_baseUrl').length && !$('#input_baseUrl').attr('aria-label')) {
            $('#input_baseUrl').attr('aria-label', 'Base URL');
          }
          if ($('#input_apiKey').length && !$('#input_apiKey').attr('aria-label')) {
            $('#input_apiKey').attr('aria-label', 'API Key Token');
          }
        }
        
        // Add labels to initial inputs
        addAccessibilityLabels();
        
        // Watch for dynamically added inputs (when operations are expanded)
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
              // Run with a small delay to ensure DOM is fully updated
              setTimeout(addAccessibilityLabels, 100);
            }
          });
        });
        
        // Start observing the swagger container for changes
        var container = document.getElementById('swagger-ui-container');
        if (container) {
          observer.observe(container, {
            childList: true,
            subtree: true
          });
        }

        var key = encodeURIComponent($('#input_apiKey')[0].value);
        if (key && key.trim() != "") {
          var apiKeyAuth = new SwaggerClient.ApiKeyAuthorization("Authorization", "Bearer " + key, "header");
          this.ui.swaggerUi.api.clientAuthorizations.add("key", apiKeyAuth);

        }
        addApiKeyAuthorization();

        function addApiKeyAuthorization() {
          var key = encodeURIComponent($('#input_apiKey')[0].value);
          if (key && key.trim() != "") {
            var apiKeyAuth = new SwaggerClient.ApiKeyAuthorization("Authorization", "Bearer " + key, "header");
            this.ui.swaggerUi.api.clientAuthorizations.add("key", apiKeyAuth);

          }
        }

        $('#input_apiKey').change(addApiKeyAuthorization);
      },
      onFailure: function (data) {

      },
      docExpansion: "none",
      sorter: "alpha"
    });

    ui.load();
    $(".token-generator").remove();



    $('#input_apiKey').change(this.addApiKeyAuthorization);

    $(".token-generator").remove();
    function log() {
      if ('console' in window) {
        console.log.apply(console, arguments);
      }
    }

    $(function () {
      $(window).scroll(function () {

        // for "Top" button functionality.
        scrollFunction();

        // implementing sticky navigation for left navigation
        var sticky = $(".sticky-nav");
        var sticky_plus = $("#swagger_sidebar");


        i(sticky);
        r(sticky);

        function n() {

          return window.matchMedia("(min-width: 992px)").matches
        }

        function e() {

          n() ? sticky.parents(".sticky-nav-placeholder").removeAttr("style") : sticky.parents(".sticky-nav-placeholder").css("min-height", sticky.outerHeight())
        }



        function i(n) {

          //var navOffset = n.offset().top;
          var navOffset = n.offset();
          n.hasClass("fixed") || navOffset;
          e();

          $(window).scrollTop() > 1000 ? $(".modal.in").length || n.addClass("fixed") : n.removeClass("fixed").css({ "top": "0px"});
          //$(window).scrollTop() > navOffset ? 0 || n.addClass("fixed") : n.removeClass("fixed")
        }

        function r(e) {
          function i() {
            var i = $(window).scrollTop(), r = e.parents(".sticky-nav");
            return r.hasClass("fixed") && !n() && (i = i + r.outerHeight() + 40), i
          }

          function r(e) {
            var t = o.next("[data-endpoint]"), n = o.prev("[data-endpoint]");
            return "next" === e ? t.length ? t : o.parent().next().find("[data-endpoint]").first() : "prev" === e ? n.length ? n : o.parent().prev().find("[data-endpoint]").last() : []
          }

          var nav = e.find("[data-navigator]");
          if (nav.find("[data-endpoint][data-selected]").length) {
            var o = nav.find("[data-endpoint][data-selected]"),
              a = $("#" + o.attr("data-endpoint")),
              //s = a.offset().top,
              s = a.offset(),
              l = (s + a.outerHeight(), r("next")),
              u = r("prev");
            if (l.length) {
              {
                var d = $("#" + l.attr("data-endpoint")), f = d.offset().top;
                f + d.outerHeight()
              }
              i() >= f && c(l)
            }
            if (u.length) {
              var p = $("#" + u.attr("data-endpoint")),
                //g = u.offset().top;
                g = u.offset();
              var v = (g + p.outerHeight(), 100);
              i() < s - v && c(u)
            }
          }
        }

        function s() {
          var e = $(".sticky-nav [data-navigator]"),
            n = e.find("[data-endpoint]").first();
          n.attr("data-selected", "");
          this.u.find("[data-selected-value]").html(n.text())
        }

        function c(e) {
          {
            var n = $(".sticky-nav [data-navigator]");
            $("#" + e.attr("data-endpoint"))
          }
          n.find("[data-resource]").removeClass("active");
          n.find("[data-selected]").removeAttr("data-selected");
          e.closest("[data-resource]").addClass("active");
          e.attr("data-selected", "");
          sticky.find("[data-selected-value]").html(e.text())
        }

        function scrollFunction() {
          if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.getElementById("topScrollBtn").style.display = "block";
          } else {
            document.getElementById("topScrollBtn").style.display = "none";
          }
        }

        function elementScrolled(elem)
        {

          var docViewTop = $(window).scrollTop();

          var docViewBottom = docViewTop + $(window).height();
          //var elemTop = $(elem).offset().top;
          var elemTop = $(elem).offset();
          return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
        }

        // This is where we use the function to detect if ".footer" is scrolled into view, and when it is add the class ".animated" to the <p> child element
        if(elementScrolled('.site-footer')) {
          $(".sticky-nav").removeClass("fixed");

        }

      });

    });


  }

  public scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  addApiKeyAuthorization() {
    var key = encodeURIComponent($('#input_apiKey')[0].value);
    if (key && key.trim() != "") {
      var apiKeyAuth = new SwaggerClient.ApiKeyAuthorization("Authorization", "Bearer " + key, "header");
      this.ui.swaggerUi.api.clientAuthorizations.add("key", apiKeyAuth);

    }
  }

}
