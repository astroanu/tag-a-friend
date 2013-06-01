(function($) {
	$.fn.srfrndtag = function(options) {
		var inp = $(this);
		var replacername = inp.attr('id')+'-srfrndtag';
		inp.before('<div id="'+replacername+'" class="srfrndtag-input" contentEditable="true"></div>');
		var replacer = $('div#'+replacername);
		var lastEl = '';
		var elems = [];
		
		function moveCursorToEnd(contentEditableElement){
		    var range,selection;
		    if(document.createRange){
		        range = document.createRange();
		       // range.selectNodeContents(contentEditableElement);
		        range.collapse(false);
		        selection = window.getSelection();
		        selection.removeAllRanges();
		        selection.addRange(range);
		    }else if(document.selection){ 
		        range = document.body.createTextRange();
		        range.moveToElementText(contentEditableElement);
		        range.collapse(false);
		        range.select();
		    }
		}
					function strip(html){
			   var tmp = document.createElement("DIV");
			   tmp.innerHTML = html;
			   return tmp.textContent||tmp.innerText;
			}
			
		function getCaretPosition(ctrl) {
    var start, end;
    if (ctrl.setSelectionRange) {
        start = ctrl.selectionStart;
        end = ctrl.selectionEnd;
    } else if (document.selection && document.selection.createRange) {
        var range = document.selection.createRange();
        start = 0 - range.duplicate().moveStart('character', -100000);
        end = start + range.text.length;
    }
    return {
        start: start,
        end: end
    }
}

		function getLastWord(elem){
			var caret = getCaretPosition(elem);
var str = elem.text();
console.log(str);
    var result = /\S+$/.exec(str.slice(0, caret.start));
    var lastWord = result ? result[0] : null;
	console.log(lastWord);
    return lastWord;
		}
		
		function format(){
			/*inp.val(text+" [@"+ui.item.value+"] ");*/
			var post = replacer.html().replace(new RegExp('<span class="tag" contenteditable="false" data-id="([a-z0-9]+)">[a-z0-9 ]+</span>','g'),'[@$1]');
			var post = post.replace(new RegExp('&nbsp;','g'),' ');
			inp.val(post);
		}

		replacer.on('click keyup', function(){
			var req = replacer.html();
			//console.log(req);
	    	elems = req.split(" ");
	    	//lastEl = strip(elems.slice(-1)[0]);
			lastEl = getLastWord(replacer);
	    	if(lastEl != undefined){
		    	var lastchr = lastEl.substring(0, 1);
		    	if(lastchr == '@' && lastchr != null){
		    		replacer.autocomplete( "enable" );
		    	}else{
		    		replacer.autocomplete( "disable" );
		    	}
	    	}
			format();
		});
		
		replacer.autocomplete({
			source: function( request, response ) {
				$.ajax({
					url: "json.json",
					dataType: "json",
					data: {
						q: function(){
							if(lastEl != undefined){
								return lastEl.substring(1);
							}else{
								return '';
							}
						}
					},
					success: function(data) {
						response($.map(data, function(item) {
							return {
								label: item.name,
								value: item.username
							}
						}));
					}
		        });
			},
			minLength: 1,
			select: function( event, ui ) {
				event.preventDefault();
		    	var text = elems;
		    	text.pop();
		    	text = text.join(" ");
				replacer.html(text+' <span class="tag" contenteditable="false" data-id="'+ui.item.value+'">'+ui.item.label+'</span>&nbsp;');
				format();
		    	moveCursorToEnd(replacer);
			},
			open: function() {
				$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
				//$('.ui-autocomplete').width($(this).width());
			},
			close: function() {
				$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			}
		});
	}
})(jQuery);