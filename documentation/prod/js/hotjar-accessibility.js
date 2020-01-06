$(window).on('load', function(){ 
    //Hotjar buttons with no title with class name of format: _hj-f5b2a1eb-9b07_btn_primary _hj-f5b2a1eb-9b07_rounded_corners
    //Add aria-label attribute to Hotjar empty buttons
    $('button[class^="_hj"][class$="_rounded_corners"]').attr("aria-label", "Hotjar Feedback button");
    $('input[class^="_hj"][class$="_input_field"],textarea[class^="_hj"][class$="_input_field"]').attr('title', 'Hotjar Input button');
    $('.required').attr("aria-label", "Enter value for parameter");
    $('#input_baseUrl').attr("aria-label", "Enter value for Base URL");
    $('#input_apiKey').attr("aria-label", "Enter value for API Key");
});
$('#_hj_feedback_container').on('load', function(){ 
    $('button[class^="_hj"][class$="_rounded_corners"]').attr("aria-label", "Hotjar Feedback button");
    $('input[class^="_hj"][class$="_input_field"],textarea[class^="_hj"][class$="_input_field"]').attr('title', 'Hotjar Input button');
});