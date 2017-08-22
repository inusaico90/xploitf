//main.js, script runs on every page

var config = {};
config.cookieaccept = ($.cookie('ca') == "ca");
config.cookiedecline = ($.cookie('cd') == "cd");
config.xcb_js = ($("meta[name=xcb_js]").attr('content'));
config.xcb_l = ($("meta[name=xcb_l]").attr('content'));
config.cookieDomain = '.xat.com';
config.date = new Date();
config.cb60 = parseInt((config.date.getTime() + 30000) / 60000);
if(!config.cookiedecline)
    config.lang = $.cookie('lang');
if(config.lang!=null && config.lang!="en")
    $('[data-localize]').hide();
config.localizeDue = 0; //number of localization files to wait for
if(!config.cookiedecline)
    config.doTranslate =  parseInt($.cookie('doTranslate'));
if(urlParam("view")) 
{
    config.doTranslate = parseInt(urlParam("view"));
	if(urlParam("lang")) config.lang = urlParam("lang");
}

$(document).ready(function() { main(); });

function main()
{
    //console.log("main");

    //determine lang from browsers HTTP_ACCEPT_LANGUAGE
    if(config.lang==null)
    {
        $.getJSON("http://xat.com/json/lang/locate.php?v="+config.xcb_l, function(o)
        {
            config.lang = o[0]['lang'];
            if(config.lang.length != 2)
			    config.lang = 'en';
            if(!config.cookiedecline)
                $.cookie('lang', config.lang, { expires: 365*2, domain: config.cookieDomain, path:'/' });
            if(typeof pupdate === 'function')
                pupdate();
        })
        .fail(function() { config.lang = "en"; });
    }

    //load languages
    $.getJSON("http://xat.com/json/lang/languages.php?v="+config.xcb_l, function(o)
    {
        var s = '';
        for(var i in o)
            if(o[i].i)
                s += '<li><a id="lang_'+o[i].c  +  '" data-lang="'  +  o[i].c + '" data-lange="'  +  o[i].e +   '" href="#">'+o[i].f+' <small>('+o[i].e+')</small></a></li>';
        s += '<li class="divider"></li>';
        s += '<li><a href="http://xat.com/web_gear/chat/changelanguage.php">More...</a></li>';
        $("#langselect").html(s);

        $('[data-lang]').click(function(e)
        {
            if(!config.cookiedecline)
			{
                $.cookie('lang', $(this).attr("data-lang"), { expires: 365*2, domain: config.cookieDomain, path:'/' });
			    $.cookie('clang', $(this).attr("data-lange"), { domain: config.cookieDomain, path:'/' });
			}
            window.location = 'http://xat.com';
            return false;
        });
    });

    //eu cookie
    if($("meta[name=xcookie]").attr('content')!='no')
    {
        $.cookieCuttr(
        {
            cookieCutter: $.cookie('cd') == "cd",
            cookieDisable: '.warning',
            cookieErrorMessage: "Features that need <a href=\"http://xat.com/privacy.html\">cookies</a> have been disabled as you have DECLINED cookies.<br><br>To continue using xat please:",
            cookieDisable: ".warning",
            cookieDiscreetLink: ($("meta[name=xcookie]").attr('content')=='big' ? false : true),
            cookieDiscreetPosition: 'bottomright',
            cookieNotificationLocationBottom: false,
            cookieDeclineButton: true,
            cookieAnalytics: false,
            cookieMessage: 'By using our services, you agree to our use of cookies. ',
            cookiePolicyLink: 'http://xat.com/privacy.html',
            cookieDomain: config.cookieDomain
        });
    }

    //scroll
    $(window).scroll(function()
    {
        // global scroll to top button
        if($(this).scrollTop() > 300)
            $('.scrolltop').fadeIn();
        else
            $('.scrolltop').fadeOut();
    });
	
    //scroll back to top btn
    $('.scrolltop').click(function()
    {
        $("html, body").animate({ scrollTop: 0 }, 700);
        return false;
    });
    
    //scroll navigation functionality
    $('.scroller').click(function()
    {
    	var section = $($(this).data("section"));
    	var top = section.offset().top;
        $("html, body").animate({ scrollTop: top }, 700);
        return false;
    });

    //IE7 and 8 stuff
    if(!$.support.leadingWhitespace)
    {
        $("body").addClass("old-ie");
    }   

    ads();

    //load page specific javascript	
    var js = $("meta[name=xj]").attr('content');
    if(js==undefined) js = "page"; 
	if(js!='none')
	    $.getScript("http://xat.com/js/"+js+".js?"+config.xcb_js, function() { if(typeof pmain === 'function') pmain(); });
	else
		if(typeof pmain === 'function') pmain(); 
}

//------------//
//localization//
//------------//

function localize(c)
{
    if(config.lang!="en")
    {
        if(config.doTranslate)
        {
            //stash english
            $('[data-localize]').each(function(index) {
                $(this).data("english", escape($(this).html()));
            });

            //create the modal dialog
            $("body").prepend('<div id="translate" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="translateID" aria-hidden="true">'+
                '  <div class="modal-header">'+
                '    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
                '    <h3 id="translateID">Modal header</h3>'+
                '  </div>'+
                '  <div class="modal-body">'+
                '    <textarea readonly id="translateEnglish" style="width: 500px" rows="8" cols="80"></textarea>'+
                '    <textarea id="translateTranslation" style="width: 500px" rows="8" cols="80"></textarea>'+
                '  </div>'+
                '  <div class="modal-footer">'+
                '    <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
                '    <button id="savetranslation" class="btn btn-primary">Save</button>'+
                '  </div>'+
                '</div>');
        }

        var xt = $("meta[name=xt]").attr('content');
        var lf = xt!=undefined ? xt.split(",") : new Array();		
        lf.push("main");
        config.localizeDue = lf.length;

        //load translations
        for(key in lf)
        {
            var path = "http://xat.com/json/translate";
            var ext = "php?v="+ config.xcb_l;
            
            if(config.doTranslate)
               ext += "&uid=" + config.doTranslate;

            $("[data-localize]").localize(lf[key], { language: c, pathPrefix: path, fileExtension: ext, failCallback: localizeFail, callback: localizeSuccess});
            //console.log(lf[key]);
        }
    }
	else if(config.lang === 'en' && urlParam("upd"))
    {
        var jse = {};

        $('[data-localize]').each(function(index) {
            var str = $(this).data('localize');
            var stra = str.split('.');
            if(jse[stra[0]]==undefined) jse[stra[0]] = {};
            jse[stra[0]][stra[1]] = $(this).html();
        });
        //console.log(jse);

        $.post("http://xat.com/json/lang/english.php", {uid:config.doTranslate, json:JSON.stringify(jse)},
			function(result){alert(result);} );
    }
}

function localizeSuccess(data, defaultCallback)
{
    config.localizeDue--;
    defaultCallback(data);
    //console.log("success localizeDue="+config.localizeDue);
    //console.log(data);
    if(config.localizeDue==0) localizeDone();
}

function localizeFail()
{
    config.localizeDue--;
    //console.log("fail localizeDue="+config.localizeDue);
    if(config.localizeDue==0) localizeDone();
}

function localizeDone()
{
    //show the english of the hidden localizable objects that didnt get localized
    $('[data-localize]').show();

    if(config.doTranslate)
    {
        config.localizeTLink = ' <a class="translate" hef="#">[t]</a>';

        //make the string table and add the [t] links
		var t, dups = new Object();
        var str = '<br><div class="container page"><h1>String Table</h1><p><table class="table table-striped">';
        str+= '<thead><tr><th>id</th><th>English</th><th>Translation</th></tr></thead>'
        $('[data-localize]').each(function(index)
        {
			t = $(this).data('localize');
			if(!dups[t])
			{
				dups[t] = true;
				str+='<tr><td>'+t+'</td><td>'+unescape($(this).data("english"))+'</td><td data-localize="'+t+'" data-english="'+$(this).data("english")+'">'+$(this).html()+config.localizeTLink+'</td></tr>';
			}
			$(this).append(config.localizeTLink);
        });
        str += '</table></p></div>';
        $("body").append(str);

        //[t] link clicked
        $("body").on("click", ".translate", function()
        {
            $('#translateID').html($(this).parent().data('localize'));
            $('#translateEnglish').val(unescape($(this).parent().data("english")));
            var str = $(this).parent().html();
            str = str.substring(0, str.indexOf(' <a class="translate"'));
            $('#translateTranslation').val(str);
            $('#translate').modal();
            return false;
        });

        //save clicked
        $("#savetranslation").click(function() {
            //update the page
            $("body").find("[data-localize='" + $('#translateID').html() + "']").html($('#translateTranslation').val()+config.localizeTLink).find('.translate').css('color', 'green');
            //close the dialog
            $('#translate').modal('hide'); 
            //post new translation to server
            var jt = new Object();
            jt['uid'] = config.doTranslate;
            jt['i'] = $('#translateID').html();
            jt['s'] = $('#translateTranslation').val();
            jt['lang'] = config.lang; 
            //console.log(JSON.stringify(jt));
            $.post("http://xat.com/json/lang/translate.php", {json:JSON.stringify(jt)}, 
				function(result){if(result!=='0') alert(result);});
        });

        //color code the [t] links
        path = "http://xat.com/json/lang/coloring.php?uid="+ config.doTranslate+"&lang="+config.lang+"&file="+$("meta[name=xt]").attr('content');  

        $.getJSON(path, function(o)
        {
            $('.translate').each(function(index) {
                var stra = $(this).parent().data('localize').split('.');
                var col = o[stra[0]]!=undefined ? o[stra[0]][stra[1]] : undefined;
                if(col!=undefined)
                    $(this).css('color', col);
            });
        });
    }
}

//---//
//ads//
//---//

var adverts=[], adindex, adids=[], adxi=0;
var adx = [
["doodleracead", "http://web.xat.com/games_chat.php"],
["snakeracead", "http://web.xat.com/games_chat.php"],
["matchracead", "http://web.xat.com/games_chat.php"],
["spacewarad", "http://web.xat.com/games_chat.php"]
];

adx = [
["xatAd", "http://xat.com/web_gear/chat/GetPowers.php"]
];

function ads()
{
	adindex=0;
    $.getJSON("http://xat.com/json/adverts.php?c="+config.cb60, function(o) { 
	if(o) o = o[config.lang];
	if(o) adverts = scramble(o);
	adx = scramble(adx);
	adnew();
	setInterval(function() { adnew(); }, 60000);
	});
}

function scramble(o)
{
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);	
	return o;
}

function GoAd(n) {
	window.location = adx[n][1];
}

function adnew()
{
	var i, s;

	// $(this).data("adtype"))

	$(".adxat").each(function(e) 
	{	
		var j = adindex>>1;
		if((adindex&1)==0 && adverts[j] && adverts[j]["group"])
			s='<a href="http://xat.com/'+adverts[j]["group"]+'"><img border="0" src="http://'+adverts[j]["adimg"]+'" width="728" height="90" /></a>';
		else
		{
			j = adxi % adx.length;
			s='<div onmousedown="GoAd('+j+');"><embed wmode="transparent" src="http://xat.com/images/ads/'+adx[j][0]+'.swf?b9" quality="high" flashvars="" width="728" height="90" align="middle" allowscriptaccess="sameDomain" type="application/x-shockwave-flash" /></div>';
			adxi++;
		}
		$(this).html(s);
		adindex++;
		if(adindex >= (adverts.length*2)) adindex=parseInt(Math.random() * 2);
	});
	
}

function urlParam(name){
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    return (results && results[1]) || 0;
}