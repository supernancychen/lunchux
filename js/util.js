(function( $ ) {
  $.storage = function (key, value) {
    if (!_.isUndefined(typeof(Storage))) {
      if (!_.isUndefined(value )) {
        localStorage.setItem(key,value);
        return '';
      }
      else {
        return localStorage[key];
      }
    }
    else {
      return '';
    }
  };
  $.removeStorage = function (key) {
    if (typeof(Storage) !== "undefined") {
      localStorage.removeItem(key);
    }
  };
  $.setCheckboxIdLabel = function($outer,checkboxGroupClassName) {
    if ($outer==null) $outer=$('body');
    if (checkboxGroupClassName==null) checkboxGroupClassName='checkbox';
    var $items = $outer.find('.'+checkboxGroupClassName);
    _.each($items,function(it){
      var $chk = $(it).find('input[type=checkbox]').first();
      var $label =$(it).find('label').first();
      var id = 'r'+_.random(0,100)+'_'+ _.now();
      $chk.attr('id',id);
      $label.attr('for',id);
    });
  };
  $.isEmpty = function(v,asEmpty) {
    var ret =   _.isNull(v) || _.isUndefined(v) || (_.isArray(v) && _.isEmpty(v)) || _.isBlank(v) || v=='null';
    if (asEmpty!=null) ret = ret ||  v==asEmpty;
    return ret;
  };


})( jQuery );

(function( $ ){
  $.jdropdown = {
    defaults: {
      start: 1,
      end: 10,
      size: 6,
      multiple:false,
      options: [{v: 1, t: 'a'}, {v: 2, t: 'b'}],
      optionType: 'number', //number,text
      changeAction: function () {
      }
    }
  };
// Constructor
  var jDropdown = function($e, options) {
    // Private vars
    var _data = $e.data('jdropdown'),
            _userOptions = (typeof options === 'function') ? { callback: options } : options,
            _options = $.extend({}, $.jdropdown.defaults, _userOptions, _data || {}),
            $item = $e,
            $text = $item.find('.drop-select'),
            $select = $item.find('.drop-list'),
            $multiBox = $item.find('.drop-multi');
    $e.data('jdropdown', $.extend({}, _data, {initialized: true}));
    _load();

    // Private methods
    function _load() {
      $select.empty();
      if (_options.optionType=='number') {
        for (var i=_options.start; i<=_options.end;i++) {
          $('<option></option>').attr('value',i).html(i).appendTo($select);
        }
      }
      else {
        _.each(_options.options,function(item){
          $('<option></option>').attr('value',item.v).html(item.t).appendTo($select);
        });
        if (_options.multiple) {
          _.each(_options.options,function(item){
            var $chkRow = $('<p></p>').addClass('checkbox').addClass('left');
            $('<input type="checkbox"/>').val(item.v).data('t',item.t).appendTo($chkRow);
            $('<label></label>').html(item.t).appendTo($chkRow);
            $chkRow.appendTo($multiBox);
          });

        }
      }

      $select.attr('size',_options.size).val(0);
      if (_options.multiple) {
        $select.attr('multiple','multiple');
      }
      $item.click(function(e){
        if (!_options.multiple){
          $('.drop-list').not($select).removeClass('open');
          $select.toggleClass('open');
        }
        e.stopImmediatePropagation();
      });
      if (_options.multiple) {
        $text.click(function(){
          $('.drop-multi').not($multiBox).removeClass('open');
          $multiBox.toggleClass('open');
        })
      }
      $multiBox.find('input[type=checkbox]').click(function(){
        var $checked = $multiBox.find('input[type=checkbox]:checked');
        var s = [],sv=[];
        if ($checked.length>0) {
          _.each($checked,function(it){
            s.push($(it).data('t'));
            sv.push($(it).val());
          });
          $text.html(s.join(', '));
          $select.val(sv.join(','));
        }
        else {
          $text.empty().html($text.data('defaulttext'));
          $select.val('');
        }
      });
      $select.on('change',function(){
        if (!_.isUndefined($(this).val())) {
          var s = [] ;
          var invalid = false;
          _.each($select.find(':selected'),function(item){
            var t =$(item).text();
            if (!_.isBlank(t.trim())) {
              s.push(t);
            }
            else {
              invalid = true;
            }
          });
          if (invalid) {
            $text.empty().html($text.data('defaulttext'));
            $(this).val('');
          }
          else
            $text.html(s.join(', '));
        }
        else {
          $text.empty();
        }
        _options.changeAction();
      });

      $('body').click(function(e){
        $select.removeClass('open');
        $multiBox.removeClass('open');
      });
    }

    // Expose API methods via the jQuery.jscroll namespace, e.g. $('sel').jdropdown.method()
    $.extend($e.jdropdown, {
    });
    return $e;
  };

// Define the jdropdown plugin method and loop
  $.fn.jdropdown = function(m) {
    return this.each(function() {
      var $this = $(this),
              data = $this.data('jdropdown');
      if (data && data.initialized) return;
      new jDropdown($this, m);
    });
  };
})(jQuery);

$.fn.clearForm = function() {
  return this.each(function() {
    var type = this.type, tag = this.tagName.toLowerCase();
    if (tag == 'form')
      return $(':input',this).clearForm();
    if (type == 'text' || type == 'password' || tag == 'textarea')
      this.value = '';
    else if (type == 'checkbox' || type == 'radio')
      this.checked = false;
    else if (tag == 'select')
      this.selectedIndex = -1;
  });
};


function getRandomByDate() {
  var d = new Date();
  return d.getFullYear().toString()+
          d.getMonth().toString()+
          d.getDate().toString()+
          d.getHours().toString()+
          d.getMinutes().toString()+
          d.getSeconds();
}
var tablesToExcel = (function() {      //put data-type, data-style,data-value ,data-formula
  var uri = 'data:application/vnd.ms-excel;base64,'
          , tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
                  + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>'
                  + '<Styles>'
                  + '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>'
                  + '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>'
                  + '</Styles>'
                  + '{worksheets}</Workbook>'
          , tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>'
          , tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>'
          , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
          , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }
  return function(tables, wsnames, wbname, appname) {
    var ctx = "";
    var workbookXML = "";
    var worksheetsXML = "";
    var rowsXML = "";
    var noExcelClass = 'noexcel';
    for (var i = 0; i < tables.length; i++) {
      if (!tables[i].nodeType) tables[i] = document.getElementById(tables[i]);
      for (var j = 0; j < tables[i].rows.length; j++) {
        if (tables[i].rows[j].className.toLowerCase().indexOf(noExcelClass)==-1) {
          rowsXML += '<Row>';
          for (var k = 0; k < tables[i].rows[j].cells.length; k++) {
            var dataType = tables[i].rows[j].cells[k].getAttribute("data-type");
            var dataStyle = tables[i].rows[j].cells[k].getAttribute("data-style");
            var dataValue = tables[i].rows[j].cells[k].getAttribute("data-value");
            dataValue = (dataValue)?dataValue:tables[i].rows[j].cells[k].innerHTML;
            var dataFormula = tables[i].rows[j].cells[k].getAttribute("data-formula");
            dataFormula = (dataFormula)?dataFormula:(appname=='Calc' && dataType=='DateTime')?dataValue:null;
            ctx = {  attributeStyleID: (dataStyle=='Currency' || dataStyle=='Date')?' ss:StyleID="'+dataStyle+'"':''
              , nameType: (dataType=='Number' || dataType=='DateTime' || dataType=='Boolean' || dataType=='Error')?dataType:'String'
              , data: (dataFormula)?'':dataValue
              , attributeFormula: (dataFormula)?' ss:Formula="'+dataFormula+'"':''
            };
            rowsXML += format(tmplCellXML, ctx);
          }
          rowsXML += '</Row>'
        }
      }
      ctx = {rows: rowsXML, nameWS: wsnames[i] || 'Sheet' + i};
      worksheetsXML += format(tmplWorksheetXML, ctx);
      rowsXML = "";
    }

    ctx = {created: (new Date()).getTime(), worksheets: worksheetsXML};
    workbookXML = format(tmplWorkbookXML, ctx);

//    s.log(workbookXML);

    var link = document.createElement("A");
    link.href = uri + base64(workbookXML);
    link.download = wbname || 'Workbook.xls';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
})();
var _storeCard='eatcard';
var firstKeyValDivider = '+';
var firstMapDivider = '|';
var secKeyValDivider = '-';
var secMapDivider = '&';
var thirdKeyValDivider = '@';
var thirdMapDivider = '#';
var thirdArrDivider = '$';
var arrStart = '*';
var arrEnd = '^';
var arrDivider = '~';
var forthKeyValDivider = '%';
var forthMapDivider = '!';
