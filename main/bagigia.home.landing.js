

$(document).ready(function () {

    var $window = $(window);
    var $document = $(document);
    var $header = $('#header');
    var $zip = $('#zip');
    var $bookmarks = $('#bookmark a');
    var $introBox = $('#intro');
    var $introContainer = $('#intro-container');
    var landingBgMoveSpeed = 1500;
    var landingBackgroundHeight = 0;
    var enableDrag = false;
    var scrollStatus = 0;

    function loadLandingBackground() {
        var regexp = /url\((.+)\)/i;
        var regexp2 = /["']/gi;
        var res = regexp.exec($introContainer.css('background-image'));
        var img_src = res[1].replace(regexp2, '');

        $introContainer.addClass('loading');

        if (img_src != '') {
            var $tempImg = $('<img />');
            $tempImg.hide().attr('src', img_src).appendTo($('body'));

            if ($tempImg[0].complete) {
                landingBackgroundHeight = $tempImg.height();
                setLandingBackgroundPosition();
            } else {
                $tempImg.bind('load', function (e) {
                    landingBackgroundHeight = $tempImg.height();
                    setLandingBackgroundPosition();
                }).attr('src', img_src);
            }
        }
    }

    function setLandingBackgroundPosition() {
        var offset = $window.scrollTop() / ($document.height() - $window.height());
        var opacity = 1 - (($window.scrollTop()) / ((3 * $window.height()) / 4));
        var newPosition = 0;

        if ($window.scrollTop() <= $introBox.height()) {
            newPosition = (landingBgMoveSpeed * offset) + (($window.height() / 2) - (landingBackgroundHeight / 2));
            if (newPosition >= 0) {
                $introContainer.css({
                    backgroundPosition: '50% ' + newPosition + 'px',
                    opacity: opacity
                });
            }
        }
    }

    function changeBookmarkOnScroll() {
        var whereIam = null;

        if ($window.scrollTop() < $('div[rel*=]:not(.bag-angle):first').position().top) {
            $('#bookmark a.selected').removeClass('selected');
            return;
        }

        $('div[rel*=]:not(.bag-angle)').each(function () {
            if ($(this).position().top <= $window.scrollTop()) {
                whereIam = $(this).attr('rel');
            }
        });

        if (whereIam != null) {
            var $divWhere = $('#bookmark a[href=' + whereIam + ']');
            if ($divWhere.length > 0 && !$divWhere.hasClass('selected')) {
                $('#bookmark a.selected').removeClass('selected');
                $divWhere.addClass('selected');
            }
        }
    }

    $window.bind('resize', function () {
        setLandingBackgroundPosition();

        $zip.find('img').draggable({
            containment: [
                ($window.width() / 2) - (($('#zip .container').width() / 2) - 14),  //x1
                0,              //y1
                ($window.width() / 2) + (($('#zip .container').width() / 2) - 45),  //x2
                0                     //y2
            ]
        });
    });

    $window.bind('scroll', function () {
        setLandingBackgroundPosition();

        if ($window.scrollTop() < 10) {
            $('#intro-mouse').addClass('show').fadeIn('slow');
        } else {
            $('#intro-mouse.show').removeClass('show').fadeOut('fast');
        }

        if ($window.scrollTop() > $window.height()) {
            introMenuAnimation();
            $header.stop().animate({ opacity: 1 }, 'fast');
            $zip.stop().animate({ opacity: 1 }, 'slow');
            $('#padigia').addClass('padigia-off');
        } else {
            $('#padigia').removeClass('padigia-off');
            $header.stop().animate({ opacity: 0 }, 'fast');
            $zip.stop().animate({ opacity: 0 }, 'fast');
        }

        scrollStatus = (($window.scrollTop() + $window.height()) / $document.height()) * 100;
        if (!enableDrag) {
            $zip.find('.closing').css({ 'width': scrollStatus + '%' });
        }

        $window.trigger('onscrollchange');

    });

    $header.css({ opacity: 0 });
    $zip.css({ opacity: 0 });
    loadLandingBackground();

    $('#intro,#intro-mouse').click(function (e) {
        e.preventDefault();
        $('html,body').animate({ scrollTop: $('.bag-blank[rel=bag0]').position().top + 5 }, 1000, 'easeInOutExpo');
    });

    $bookmarks.click(function (e) {
        e.preventDefault();
        var $clicked = $(this);

        if (!$clicked.hasClass('selected')) {
            var scrollTo = $('div[rel=' + $clicked.attr('href') + ']').position().top + ($('div[rel=' + $clicked.attr('href') + ']').height() / 2);
            $window.unbind('onscrollchange');

            $('#bookmark a.selected').removeClass('selected');
            $clicked.addClass('selected');

            $('html,body').stop().animate({ scrollTop: scrollTo + 2 }, 'slow', function () { $window.bind('onscrollchange', changeBookmarkOnScroll); });

        }
    });

    $window.bind('onscrollchange', changeBookmarkOnScroll);

    $zip.find('img').draggable({
        axis: 'x',
        containment: [
            ($window.width() / 2) - (($('#zip .container').width() / 2) - 14),  //x1
            0,              //y1
            ($window.width() / 2) + (($('#zip .container').width() / 2) - 45),  //x2
            0                     //y2
        ],

        drag: function (event, ui) {
            var newWidth = (ui.position.left + ($zip.find('img').width() / 2));
            var scrollPercentage = ((newWidth * 100) / $zip.find('.zip-close').width());
            $zip.find('.closing').width(newWidth);
            window.scrollTo(0, ($document.height() * (scrollPercentage - 5)) / 100);
        },

        start: function (event, ui) {
            enableDrag = true;
        },

        stop: function (event, ui) {
            enableDrag = false;
            $zip.find('img').css({ 'left': 'auto' });
            if ($window.scrollTop() + $window.height() > $document.height() - ($window.height() / 2)) {
                $('html, body').animate({ scrollTop: $document.height() });
            }
        }
    });

});

$(window).unbind();
$(window).load(function () {

    setTimeout(function () {
        $('#start').fadeOut('slow', function () {
            $(this).remove();
            $('.inload').removeClass('inload');
            $('body>div:not(#intro,#intro-mouse,#bookmark)').show();
            $('#intro-mouse,#bookmark').fadeIn('slow').addClass('show');
            $('body').trigger('load_finish');
        });
    }, 600);
});

$('body>div:not(#intro,#header,#intro-mouse)').hide();
