function replaceSVGs() {
    jQuery('.svg:not(.replaced)').each(function (param) { // Avoid reprocessing
        const $img = jQuery(this);
        const imgID = $img.attr('id');
        const imgClass = $img.attr('class');
        const imgURL = $img.attr('src');
        
        jQuery.get(imgURL, (data) => {
            let $svg = jQuery(data).find('svg');
            if (imgID) $svg.attr('id', imgID);
            if (imgClass) $svg.attr('class', `${imgClass} replaced-svg`);
            $svg.removeAttr('xmlns:a');
            $img.replaceWith($svg);
        }, 'xml');
    });
}

$(document).ready(function() {
    replaceSVGs();
});