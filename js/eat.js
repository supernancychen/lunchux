var EAT = {
  saveInfo : true,
  debug: false,
  tooltipSet:false,
  maxKids : 20,
  maxAdults : 10,
  maxStep:0,
  isSkipIncome:false,
  gInfo : {
    'username':'',
    'kids':{num:0,info:[]},
    'isInBenefitProgram' :0,
    'benefitCaseNumber':'',
    'adults':{num:0,info:[]},
    'totalMembers':0,
    'lastSSN':'',
    'noSSN':0,
    'address':'',
    'apt':'',
    'city':'',
    'state':'',
    'zip':'',
    'signature':'',
    'signaturePrint':'',
    'phone':'',
    'email':'',
    'signDate':''
  },
  kidCardInfo : {
    'childFirstName': '',
    'childMiddleName':'',
    'childLastName': '',
    'isStudent': 0,
    'isFoster': 0,
    'isHomeless' : 0,
    'withIncome':0,
    'incomeSalary':{amt:0,often:0},
    'SSBenefit':{amt:0,often:0},
    'outerPerson':{amt:0,often:0},
    'otherIncome':{amt:0,often:0},
    'ethnicity':'',
    'race':[]
  },
  adultCardInfo : {
    'adultFirstName':'',
    'adultLastName':'',
    'withIncome': 0,
    'work':[],//[{type:0,amt:0,often:0}],
    'military':[],//[{type:0,amt:0,often:0}],
    'assistance':[],//[{type:0,amt:0,often:0}],
    'retirement':[],//[{type:0,amt:0,often:0}],
    'otherAdultIncome':[]//[{type:0,amt:0,often:0}]
  },
  emptyKidCard:null,
  emptyKidIncome:null,
  emptyKidIncomeOften:null,
  emptyAdultCard:null,
  emptyAdultIncomeOften:null,
  emptyKidInfo:null,
  emptyAdultInfo:null,
  restart:function() {
    var that = this;
    localStorage.clear();

    $('#eatForm').clearForm();
    $('aside li').removeClass('enabled');
    $('#kidCards').empty();
    $('#kidIncome').empty();
    $('#adultCards').empty();
    $('.incomeOftenBox').remove();
    $('.adultIncomeOftenBox').remove();
    $('.dropdown.valid').addClass('required');

    $('#cStep1 .btn-line').addClass('w400');
    _.each($('span.fields'),function(it){$(it).html($(it).data('defaulttext'))});
    this._restoreTitle($('[title]'));
    this.isSkipIncome=false;
    $('body').prop('class','');
    $('#cStep3').find('.next').data('nav','cStep3-1').removeAttr('disabled');


    this._setMaxStep(0);
    this.gInfo = {
      'username':'',
      'kids':{num:0,info:[]},
      'isInBenefitProgram' :0,
      'benefitCaseNumber':'',
      'adults':{num:0,info:[]},
      'totalMembers':0,
      'lastSSN':'',
      'noSSN':0,
      'address':'',
      'apt':'',
      'city':'',
      'state':'',
      'zip':'',
      'signature':'',
      'phoneOrEmail':'',
      'signDate':''
    };
    this.displayCurrentCard();
  },
  init:function() {
 //   localStorage.clear();
    var that = this;
    this._debug('info','entering init...');
    $.setCheckboxIdLabel();
    var dh = $(window).height()-900;
    if (dh<100) dh=100;
    $('#cWelcome .btn.next').closest('p')
            .css('margin-top',dh+'px')
            ;
    _.defer(function(){
      $('body').removeClass('loading');
    });
    $('HEADER ASIDE LI').click(function(){
      if ($(this).hasClass('enabled')) {
        var step = $(this).data('step');
        var fromCardId = $(this).closest('.card').attr('id');
        var toCardId = 'cStep' + step;
        that.toChangeCard(fromCardId, toCardId);
      }
    });
    $('.btn.next').click(function(){that.changeCard($(this));});
    $('.btn.back').click(function(){that.changeCard($(this));});
    $('.fields').keyup(function(){
      if ($(this).hasClass('validation')) {
        that.setCardNextButton($(this).parents('section').attr('id'));
      }
    }).blur(function(){
      if ($(this).hasClass('validation')) {
        that.setCardNextButton($(this).parents('section').attr('id'));
      }
    });


    /*step 1*/
    $('#cStep1 .dropdown').jdropdown({start:1,end:this.maxKids,
      changeAction:function() {
        that.gInfo['kids']['num']=$('#kidsNumber').val();
        $('#kidsNumber').closest('.dropdown').find('.drop-select').removeClass('required');
        that.toChangeCard('cStep1','cStep1');
      }
    });
    this.emptyKidCard = $('.kid-card').first().clone();
    $('#kidCards').empty();

    /*step 2*/
    $('.chkIsBenefit').click(function(){
      that.gInfo['isInBenefitProgram']=$(this).is(':checked')?1:0;
      that.initCard('cStep2');
    });
    $('.ui-input').keyup(function(){
      if ($(this).val().length==parseInt($(this).data('len'))) {
        $(this).next('.ui-input').focus();
      }
      that._setCaseNumber();
    });

    /* step 3 ssn */
    var step3CardId = 'cStep3';
    var $step3Card = $('#'+step3CardId);
    var $ssnBox = $('#step3SSN');
    var $ssn = $ssnBox.find('input[type=text]');
    var $noSSNChk = $ssnBox.find('input[type=checkbox]');
    $ssn.keyup(function () {
      var v = $(this).val();
      var isValid =  $.isNumeric(v) && ( v+'').length==4 ?1:0;
      $step3Card.data('valid',isValid);
      $noSSNChk.removeAttr('checked');
      that.setCardNextButton(step3CardId);
    })
            .blur(function () {
              var v = $(this).val();
              var isValid = v.length==4 && $.isNumeric(v)?1:0;
              $step3Card.data('valid',isValid);
              that.setCardNextButton(step3CardId);
              $noSSNChk.removeAttr('checked');
            });

    $noSSNChk.click(function () {
      $ssn.toggleClass('validation',!$(this).is(':checked'));
      if ($(this).is(':checked')) {
        $step3Card.data('valid', 1);
        $ssn.val('').removeAttr('required');
        that._emptyTitle($ssn);
      }
      else {
        $ssn.attr('required','required');
      }

      that.setCardNextButton(step3CardId);
    });

    /*step 3 kidsIncome*/
    this.emptyKidIncomeOften = $('.incomeOftenBox').first().clone();
    $('.incomeOftenBox').remove();
    _.each($('.kid-income .with-income'),function(item){
      $(item).append(that.emptyKidIncomeOften.clone());
    });
    this.emptyKidIncome = $('.kid-income').first().clone();
    $('#kidIncome').empty();

    this.emptyKidInfo = $.extend({}, that.kidCardInfo);
    this.emptyAduktInfo = $.extend({}, that.adultCardInfo);
    /*step 3 adultIncome */
    $('#cStep3-2 .adult-num.dropdown').jdropdown({start:1,end:this.maxAdults,
      changeAction:function() {
        that.gInfo['adults']['num']=$('#adultsNumber').val();
        that.toChangeCard('cStep3-2','cStep3-2');

      }
    });

    this.emptyAdultCard = $('.adult-card').first().clone();
    $('#adultCards').empty();
    this.emptyAdultIncomeOften = $('.adultIncomeOftenBox').first().clone();
    $('.adultIncomeOftenBox').remove();

    /*step 4*/
    var mState = that._setStateMap();
    $('#cStep4 .dropdown').jdropdown({
      options:mState,
      optionType:'text',
      size:10,
      changeAction:function() {
        $('#cStep4 .dropdown .drop-select').css('color','#333');
      }

    });

    /*step4-1 signature*/
    var $signatures = $('#step4-1 input[type=text]');
    $signatures.keyup(function(){
      var $txt1 = $($signatures[0]);
      var $txt2 = $($signatures[1]);
      var valid = $txt1.val()==$txt2.val()?1:0;
      $('#step4-1').data('valid',valid);
    })
            .blur(function(){
              var $txt1 = $($signatures[0]);
              var $txt2 = $($signatures[1]);
              var valid = $txt1.val()==$txt2.val()?1:0;
              $('#step4-1').data('valid',valid);
            });
    this.displayCurrentCard();
  },
  _restoreTitle:function($els,when) {
    if (when==null) when = true;
    if (when) {
      if ($els.length>1) {
        _.each($els,function(item){
          var $e = $(item);
          if (!$.isEmpty($e.data('title'))) $e.attr('title', $e.data('title'));
        });
      }
      else
        if (!$.isEmpty($els.data('title'))) $els.attr('title', $els.data('title'));
    }
  },
  _emptyTitle:function($e,when) {
    if (when==null) when = true;
    if (when) {
      if ($.isEmpty($e.data('title'))) $e.data('title',$e.attr('title'));
      $e.attr('title','');
    }
  },
  _setTitle:function($e) {
    this._emptyTitle($e,$e.is(':valid'));
    this._restoreTitle($e,$e.is(':invalid') && _.isBlank($e.attr('title')));
  },
  _setIncomeTypeMap:function(typeName){
    var ret = [];
    var arr = Constant.gAdultIncomeType[typeName];
    for (var i=0;i<arr.length;i++) {
      ret.push({v:i+1,t:arr[i]});
    }
    return ret;
  },
  _setOftenMap:function(){
    var ret = [];
    for (var i=0;i<Constant.gOften.length;i++) {
      ret.push({v:i+1,t:Constant.gOften[i]});
    }
    return ret;
  },
  _setEthnicityMap:function(){
    var ret = [];
    for (var i=0;i<Constant.gEthnicity.length;i++) {
      ret.push({v:i+1,t:Constant.gEthnicity[i]});
    }
    return ret;
  },
  _setStateMap:function(){
    var ret = [];
    for (var i=0;i<Constant.gState.length;i++) {
      ret.push({v:i+1,t:Constant.gState[i]});
    }
    return ret;
  },
  _setRaceMap:function(){
    var ret = [];
    for (var i=0;i<Constant.gRace.length;i++) {
      ret.push({v:i+1,t:Constant.gRace[i]});
    }
    return ret;
  },
  _setCaseNumber:function() {
    var cardId = 'cStep2';
    var $card = $('#'+cardId);
    $('#benefitCaseNumber').val($('.c1').val()+''+$('.c2').val()+''+$('.c3').val()+''+$('.c4').val());
    var isValid=0;
    var c1=$('.ui-input.c1').val();
    var c2=$('.ui-input.c2').val();
    var c3=$('.ui-input.c3').val();
    var c4=$('.ui-input.c4').val();
    if ($.isNumeric(c1) && $.isNumeric(c2) && $.isNumeric(c3) && c1.length+c2.length+c3.length+c4.length>=10) isValid=1;
    $card.data('valid',isValid);
    this.setCardNextButton('cStep2');
  },
  _parseCaseNumber:function() {
    var v = $('#benefitCaseNumber').val();
    if (!$.isEmpty(v)) {
      $('.ui-input.c1').val(v.substring(0,2));
      $('.ui-input.c2').val(v.substring(2,5));
      $('.ui-input.c3').val(v.substring(5,7));
      $('.ui-input.c4').val(v.substring(7));
    }
  },
  setCardNextButton:function(cardId){
    var that = this;
    var $NextBtn = $('#'+cardId+' .btn.next');
    var $validationFields = $('#'+cardId+' .validation');
    var valid = true;
    _.each($validationFields,function(item) {
      var v = $(item).val();
      if ($.isEmpty(v)) valid=false;
    });
  //  console.log('valid1='+valid);
    if (!_.isNull($('#'+cardId).data('valid')) && $('#'+cardId).data('valid')=='0') {  // more validation
      valid = false;
    }
 //   console.log('valid2='+valid);
    if (!valid) {
      $NextBtn.attr('disabled', 'disabled');
    }
    else {
      $NextBtn.removeAttr('disabled');
    }
    this._resetRequired(cardId);
    if(!this.tooltipSet) this._tooltips($('body'));
  },
  _dataValidation:function() {   return;
    var that = this;
    _.each($card.find(' .validation'),function(item){
      var ev = $._data($(item), 'events');
      if(ev && ev.blur) {}
      else {
        $(item).blur(function(){
          that._restoreTitle($(this),$(this).hasClass('tip'));
        });
      }
    });
  },
  _resetRequired:function(cardId){
    var $card = $('#'+cardId);
    var that = this;
    $card.find(' .validation').attr('required','required');
   // this._dataValidation($card);
    var data = $card.data('valid');
    $card.toggleClass('invalid-card',data!=null && data=='0');

    if ($card.hasClass('invalid-card')){
      var $inputs = $('#'+cardId+'.invalid-card input[type=text]');
      if (!$.isEmpty($card.data('invalididx')))  {
        var invalidIdx = parseInt($card.data('invalididx'));
        var ppIdx = parseInt($card.data('ppidx'));
        if (cardId=='cStep3-1' || cardId=='cStep3-2') {
          $inputs = $('#'+cardId+'.invalid-card .invalid-row input[type=text]');
        }
      }
      this._restoreTitle($inputs);
    }
    else {
      _.each($card.find(' .dropdown.valid.required'),function(item) {
        var select = $(item).find('.drop-list').first().val();
        $(item).toggleClass('required',$.isEmpty(select));
      });
        _.each($card.find('.validation'), function (item) {
          if ($(item).is(':valid')) {
            that._emptyTitle($(item));
          }
          if ($(item).is(':invalid') && _.isBlank($(item).attr('title'))) {
            that._restoreTitle($(item));
          }
        });
        _.each($card.find(' .valid'), function (item) {
          if (!$(item).hasClass('required')) {
            that._emptyTitle($(item));
          }
          else {
            if (_.isBlank($(item).attr('title'))) {
              that._restoreTitle($(item));
            }
          }
        });
    }
  },
  _setTabIndex:function(cardId){
    _.each($('#'+cardId+' .fields').not('span'),function(item,i){$(item).attr('tabindex',i)});
  },
  _setMaxStep:function(step){
    var that = this;
//     this.maxStep = Math.max(step,this.maxStep);
    this.maxStep = step;
    $('aside li.enabled').removeClass('enabled');
    _.each($('aside li'),function(it,i){
      if (i+1<=that.maxStep) {$(it).addClass('enabled');}
    });
  },
  initCard:function(cardId){
    var $card = $('#'+cardId);
    if (cardId=='cStep1') {
      this._setMaxStep(1);
      this._initStep1();
    }

    if (cardId=='cStep2') {
      this._setMaxStep(2);
      this._initStep2();
    }
    if (cardId=='cStep3') {
      this._setMaxStep(3);
      this._initStep3Skip();
    }
    if (cardId=='cStep3-1') {
      this._setMaxStep(3);
      this._initStep3KidIncome();
    }
    if (cardId=='cStep3-2') {
      this._setMaxStep(3);
      this._initStep3AdultIncome();
    }
    if (cardId=='cStep3-3') {
      this._setMaxStep(3);
      this._initStep3IncomeSummary();
    }
    if (cardId=='cStep4') {
      this._setMaxStep(4);
      this._initStep4Address();
    }
    if (cardId=='cStep4-1') {
      this._setMaxStep(4);
      this._initStep4Signature();
    }
    if (cardId=='cConfirm') {
      this._setMaxStep(4);
      this._initReviewConfirm();
    }
    if (cardId=='cExport') {
      this._setMaxStep(4);
      this._initExport();
    }
  },
  _tooltips:function($outer){
    this.tooltipSet=true;
    $($outer).find(' .help').tooltip({
      items:'.help',
      tooltipClass:'help-tooltip',
      position: {
        my: "center bottom-20",
        at: "center top",
        using: function( position, feedback ) {
          $( this ).css( position );
          $( "<div>" )
                  .addClass( "arrow" )
                  .addClass( feedback.vertical )
                  .addClass( feedback.horizontal )
                  .appendTo( this );
        }
      }
    });
  //  this._emptyTitle($('.validation'));
    $('.validation').tooltip({
      tooltipClass:'input-tooltip',
      position: {
        my: "center bottom-20",
        at: "center top",
        using: function( position, feedback ) {
          $( this ).css( position );
          $( "<div>" )
                  .addClass( "arrow" )
                  .addClass( feedback.vertical )
                  .addClass( feedback.horizontal )
                  .appendTo( this );
        }
      }
    });
    $('.valid.required').tooltip({

      tooltipClass:'input-tooltip',
      position: {
        my: "center bottom-20",
        at: "center top",
        using: function( position, feedback ) {
          $( this ).css( position );
          $( "<div>" )
                  .addClass( "arrow" )
                  .addClass( feedback.vertical )
                  .addClass( feedback.horizontal )
                  .appendTo( this );
        }
      }
    });
  },
  _initStep2:function() {
    var cardId = 'cStep2';
    var $card = $('#'+cardId);
    var $caseNum = $('.ui-input');
    var $chk = $('#chkIsBenefit');
    this.infoToScreen(cardId);
    this._parseCaseNumber();
    var v = (this.gInfo['isInBenefitProgram']);
    if (!$.isEmpty(v) && this.gInfo['isInBenefitProgram'] == 1) {
      $chk.attr('checked', 'checked');
      $caseNum.addClass('validation');
      $('.ui-input-line').show();
      $('.c1').focus();
      this._setCaseNumber();
    }
    else {
      $card.data('valid', 1);
      $chk.removeAttr('checked');
      $caseNum.removeClass('validation');
      $('.ui-input-line').hide();
      this.setCardNextButton(cardId);
    }
    this.setCardNextButton(cardId);
  },
  cleanStep3Skip:function() {
    var $card = $('#cStep3');
    var that = this;
    if (this.isSkipIncome) {
      this.gInfo['adults']['num']=0;
      this.gInfo['adults']['info']=[];
      _.each(this.gInfo['kids']['info'],function(item){
        _.each(Constant.gKidsIncomeLabel,function(v,k){
          item[k]={amt:0,often:0};
        });
      });
    }
  },
  cleanStep3KidIncome:function(){
    var $card = $('#cStep3-1');
    var $chks = $card.find('.with-income input[type=checkbox]');
    _.each($chks,function(item){
      if (!$(item).is(':checked')) {
        $(item).closest('.with-income').find('.fields').val('');
        $(item).closest('.with-income').find('.drop-select').html( $(item).closest('.with-income').find('.drop-select').data('defaulttext'));
      }
    });
  },
  cleanStep3AdultIncome:function(){
    var $card = $('#cStep3-2');
    var $chks = $card.find('.with-income input[type=checkbox]');
    var that = this;
    _.each($chks,function(item){
      if (!$(item).is(':checked')) {
        $(item).closest('.with-income').find('.adultIncomeOftenBox').remove();
        $(item).closest('.with-income').find('.add-more').remove();
        var adultIdx = $(item).closest('.adult-card').data('idx');
        var incomeTypeName = $(item).closest('.with-income').data('id');
        if (that.gInfo['adults']['info'][adultIdx]!=null)
        that.gInfo['adults']['info'][adultIdx][incomeTypeName]=[];
      }
    });
  },
  _initStep4Address:function(){
    var that = this;
    this.infoToScreen('cStep4');
    var cardId = 'cStep4';
    $('#cStep4 .fields.validation').keyup(function(){
      that.setCardNextButton(cardId);
    })
            .blur(function(){
              that.setCardNextButton(cardId);
            });
    that.setCardNextButton(cardId);
  },
  _initStep4Signature:function() {
    var that = this;
    this.infoToScreen();
    var cardId= 'cStep4-1';
    if (_.isBlank(this.gInfo['signaturePrint']))
      $('#signaturePrint').val(this.gInfo['username']);
    else
      $('#signaturePrint').val(this.gInfo['signaturePrint']);

    $('#signedDate').html(moment().format('MMMM D, YYYY'));
    $('#cStep4-1 .fields.validation').keyup(function(){
      var valid =  ($('#signature').val()==$('#signaturePrint').val())?1:0;
      $('#cStep4-1').data('valid',valid);
      that.setCardNextButton(cardId);
    })
    .blur(function(){
              var valid =  ($('#signature').val()==$('#signaturePrint').val())?1:0;
              $('#cStep4-1').data('valid',valid);
              that.setCardNextButton(cardId);
    });
    that.setCardNextButton(cardId);
  },
  _appendStringTd:function(val,$tr) {
    var xlsStringType = 'String';
    $('<td></td>').attr('data-value',val).attr('data-type',xlsStringType).html(val).appendTo($tr);
  },
  _appendCurrencyTd:function(val,$tr) {
    var xlsNumberType = 'Number';
    $('<td></td>').attr('data-value',val).attr('data-type',xlsNumberType).attr('data-style','Currency').html(val).appendTo($tr);
  },
  _initExport:function(){
    this._debug('info','entering _initExport...');
    var that = this;
    var val;
    var kidsInfo = this.gInfo['kids']['info'];
    var $exportTable = $('#exportTable').empty();

    $('aside li.enabled').removeClass('enabled');
    _.each(kidsInfo,function(item){
      var $tr = $('<tr></tr>');
      val = 'Child Name:';
      that._appendStringTd(val,$tr);
      val = item['childFirstName']+' '+item['childLastName'];
      that._appendStringTd(val,$tr);
      $tr.appendTo($exportTable);

      var labels=[];
      _.each(Constant.gKidsFeatureLabel,function(v,k){
        if (item[k]==1) labels.push(v);
      });
      val = labels.length>0?labels.join(', '):'';
      that._appendStringTd(val,$tr);
      $tr.appendTo($exportTable);
    });

    var $tr1 = $('<tr></tr>');
    if (this.gInfo['isInBenefitProgram']==1) {
      val = 'Assistant Program Case Number';
      that._appendStringTd(val,$tr1);
      val = this.gInfo['benefitCaseNumber'];
      that._appendStringTd(val,$tr1);
    }
    else {
      val = 'Assistant Program';
      that._appendStringTd(val,$tr1);
      val = 'None';
      that._appendStringTd(val,$tr1);
    }
    $tr1.appendTo($exportTable);


   if (this.isSkipIncome) {
     var $tr21 = $('<tr></tr>');
     val = 'Household Income';
     that._appendStringTd(val,$tr21);
     val = '(skip)';
     that._appendStringTd(val,$tr21);
     $tr21.appendTo($exportTable);
   }
    else {
     var kids = this.gInfo['kids']['info'];
     _.each(kids,function(item){
       var $tr2 = $('<tr></tr>');
       var val = item['childFirstName']+' '+item['childLastName'];
       that._appendStringTd(val,$tr2);
       var withIncome = false;
       _.each(Constant.gKidsIncomeLabel,function(v,k){
         if (!$.isEmptyObject(item[k]) && parseInt(item[k]['amt'])>0) {
           val = parseInt(item[k]['amt']);
           that._appendCurrencyTd(val,$tr2);
           var often = item[k]['often'];
           val = Constant.gOften[often-1];
           that._appendStringTd(val,$tr2);
           withIncome=true;
         }
       });
       if (!withIncome) {
         val = 'This child has no income to report';
         that._appendStringTd(val,$tr2);
       }
       $tr2.appendTo($exportTable);
     });

     var $tr3 = $('<tr></tr>');
     var adults = this.gInfo['adults']['info'];
     _.each(adults,function(item){
       val = item['adultFirstName']+' '+item['adultLastName'];
       that._appendStringTd(val,$tr3);
       var withIncome = false;
       _.each(Constant.gAdultsIncomeLabel,function(v,k){
         var incomeArr = item[k];
         _.each(incomeArr,function(it,idx){
           var amt = parseInt(it['amt']);
           if (amt>0) {
             if (idx==0) {
               val = v;
               that._appendStringTd(val,$tr3);
             }
             var type = it['type'];
             var often = it['often'];
             val = Constant.gAdultIncomeType[k][type];
             that._appendStringTd(val,$tr3);
             val = amt;
             that._appendCurrencyTd(val,$tr3);
             val = Constant.gOften[often-1];
             that._appendStringTd(val,$tr3);
             withIncome=true;
           }
         });
       });
       if (!withIncome) {
         val = 'This household member has no income to report';
         that._appendStringTd(val,$tr3);
       }
       $tr3.appendTo($exportTable);

     });

   }

    var $tr4 = $('<tr></tr>');
    val= 'Address';
    that._appendStringTd(val,$tr4);
    val =
            (_.isBlank(this.gInfo['apt'])?'':this.gInfo['apt'] )+' '+
            this.gInfo['address'] +' '+
            this.gInfo['city'] +', '+
            this.gInfo['state'] +' '+
            this.gInfo['zip'];
    that._appendStringTd(val,$tr4);
    $tr4.appendTo($exportTable);

    if (!_.isBlank(this.gInfo['phone'])) {
      var $tr5 = $('<tr></tr>');
      val = 'Phone';
      that._appendStringTd(val,$tr5);
      val = this.gInfo['phone'];
      that._appendStringTd(val,$tr5);
      $tr5.appendTo($exportTable);
    }

    if (!_.isBlank(this.gInfo['email'])) {
      var $tr6 = $('<tr></tr>');
      val = 'Email';
      that._appendStringTd(val,$tr6);
      val = this.gInfo['email'];
      that._appendStringTd(val,$tr6);
      $tr6.appendTo($exportTable);
    }

    var $tr7 = $('<tr></tr>');
    val = 'Signature';
    that._appendStringTd(val,$tr7);
    val = this.gInfo['signature'];
    that._appendStringTd(val,$tr7);
    $tr7.appendTo($exportTable);

    $("#exportTable").tableExport({
      headings: true,
      formats: ["xlsx"],
      fileName: "id",
      bootstrap: false,
      position: "bottom"
    });

  },
  download:function(){
      $('#exportTable caption a').first().trigger('click');

//    tablesToExcel(['exportTable'],['eat'],'eat.xls','Excel');
  },
  _initReviewConfirm:function() {
    this._debug('info','entering _initReviewConfirm...');
    var that = this;

    var kidsInfo = this.gInfo['kids']['info'];
    var $childInfo = $('.summary-card.child-info .child-list').first().empty();

    _.each(kidsInfo,function(item){
      var name = item['childFirstName']+' '+item['childLastName'];
      $('<h2></h2>').html(name).appendTo($childInfo);
      var labels=[];
      _.each(Constant.gKidsFeatureLabel,function(v,k){
        if (item[k]==1) labels.push(v);
      });
      var lb = labels.length>0?labels.join(', '):'N/A';
      $('<p></p>').html(lb).appendTo($childInfo);
    });

    var $assistantInfo = $('.summary-card.assistant-info .assistant-list').first().empty();
    if (this.gInfo['isInBenefitProgram']==1)
      $('<p></p>').html('Case Number: '+this.gInfo['benefitCaseNumber']).appendTo($assistantInfo);
    else
      $('<p></p>').html('N/A').appendTo($assistantInfo);

    var $householdInfo = $('.summary-card.household-info .household-list').first().empty();

    if (this.isSkipIncome) {
      $('<p></p>').html('(Skip)').appendTo($householdInfo);
    }
    else {
        that.__kidsIncomeSummary($householdInfo);
        that.__adultsIncomeSummary($householdInfo);
    }

    var $contactnsign = $('.summary-card.contactnsign-info .contactnsign-list').first().empty();
    var addr =
            (_.isBlank(this.gInfo['apt'])?'':this.gInfo['apt'] )+' '+
            this.gInfo['address'] +' '+
            this.gInfo['city'] +', '+
            Constant.gState[this.gInfo['state']-1] +' '+
            this.gInfo['zip'];
    $('<p></p>').html('Address: '+addr).appendTo($contactnsign);
    if (!_.isBlank(this.gInfo['phone'])) {
      $('<p></p>').html('Phone: '+this.gInfo['phone']).appendTo($contactnsign);
    }
    if (!_.isBlank(this.gInfo['email'])) {
      $('<p></p>').html('Email: '+this.gInfo['email']).appendTo($contactnsign);
    }
    $('<p></p>').html('Signature: '+this.gInfo['signature']).appendTo($contactnsign);
  } ,
  __kidsIncomeSummary:function($kidsBox) {
    var that = this;
    var kids = this.gInfo['kids']['info'];
    _.each(kids,function(item){
      var name = item['childFirstName']+' '+item['childLastName'];
      $('<h2></h2>').html(name).appendTo($kidsBox);
      var withIncome = false;
      _.each(Constant.gKidsIncomeLabel,function(v,k){
        if (!$.isEmptyObject(item[k]) && parseInt(item[k]['amt'])>0) {
          var amt = item[k]['amt'];
          var often = item[k]['often'];
          $('<p></p>').html(v+': $'+amt+', '+Constant.gOften[often-1]).appendTo($kidsBox);
          withIncome=true;
        }
      });
      if (!withIncome) {
        $('<p></p>').html('This child has no income to report').appendTo($kidsBox);
      }
    });
  },
  __adultsIncomeSummary:function($adultsBox) {
    var that = this;
    var adults = this.gInfo['adults']['info'];
    _.each(adults,function(item){
      var name = item['adultFirstName']+' '+item['adultLastName'];
      $('<h2></h2>').html(name).appendTo($adultsBox);
      var withIncome = false;
      _.each(Constant.gAdultsIncomeLabel,function(v,k){
        var incomeArr = item[k];
        _.each(incomeArr,function(it,idx){
          var amt = parseInt(it['amt']);
          if (amt>0) {
            if (idx==0) {
              $('<p></p>').html(v+': ').appendTo($adultsBox);
            }
            var type = it['type'];
            var often = it['often'];
            $('<p></p>').addClass('sub-income').html(Constant.gAdultIncomeType[k][type]+': $'+amt+', '+Constant.gOften[often-1]).appendTo($adultsBox);
            withIncome=true;
          }
        });
      });
      if (!withIncome) {
        $('<p></p>').html('This household member has no income to report').appendTo($adultsBox);
      }
    });
  },
  _initStep3IncomeSummary:function(){
    this._debug('info','entering _initStep3IncomeSummary...');
    var that = this;
    var $kidsBox = $('.summary-card.kids-summary .kid-list').first().empty();
    this.__kidsIncomeSummary($kidsBox);

    var $adultsBox = $('.summary-card.adults-summary .adult-list').first().empty();
    this.__adultsIncomeSummary($adultsBox);

  },
  _initStep3AdultIncome:function() {
    this._debug('info','entering _initStep3AdultIncome...');
    var that = this;
    var cardId = 'cStep3-2';
    var $card = $('#'+cardId);
    var adultNum = parseInt(this.gInfo['adults']['num']);
    var $adultCardsOuter = $('#adultCards');
    $adultCardsOuter.empty();
    if (adultNum>0) {
      // adult income card
      _.times(adultNum,function(){
        that.emptyAdultCard.clone().appendTo($adultCardsOuter);
      });

      that.__adultIncomeEvents();

      // print adult idx
      _.each($('.adult-index'), function (item, i) {
        $(item).html(i + 1);
        $(item).closest('.adult-card').data('idx', i);
      });

      // append often box
      var $withIncomes = $($card.find('.with-income'));
      _.each($withIncomes, function (item) {
        var $incomeRow = $(item);
        var adultIdx = parseInt($incomeRow.closest('.adult-card').data('idx'));
        var incomeTypeName = $incomeRow.data('id');
        if (that.gInfo['adults']['info'][adultIdx]!=null &&  that.gInfo['adults']['info'][adultIdx][incomeTypeName]!=null) {
          var incomeTypeNum = that.gInfo['adults']['info'][adultIdx][incomeTypeName].length;
          if (incomeTypeNum>0) {
            for (var i=0;i<incomeTypeNum;i++)  {
              that.__appendAdultIncomeTypeOften($incomeRow);
            }
            that.__appendAdultIncomeTypeAddMore($incomeRow);
          }
        }
      });

      that.__adultIncomeInfoToScreen(cardId);
      that._tooltips($withIncomes);


      // enable/disable next button
      that.setCardNextButton(cardId);

      $card.find('.btn-line').removeClass('w400');
      $.setCheckboxIdLabel($card);
      that._setSpanValidClass($('#adultCards'));
    }
    else {
      that.infoToScreen(cardId);
      that.setCardNextButton(cardId);
    }
  },
  __appendAdultIncomeTypeAddMore:function($incomeRow) {
    var that = this;
    var incomeType = $incomeRow.data('id');
    var cardId = 'cStep3-2';
    var mType = that._setIncomeTypeMap(incomeType);
    $incomeRow.find('.type-list').last().clone()
            .addClass('add-more').appendTo($incomeRow);
    that._setSpanValidClass($incomeRow);

    var $addMore = $incomeRow.find('.add-more').first();
    $addMore.find('.dropdown').jdropdown({
      options: mType,
      optionType: 'text',
      changeAction: function () {
        var $sel = $addMore.find('select').first();
        var value = $sel.val();
        var text = $sel.find(':selected').text();
        that.__appendAdultIncomeTypeOften($incomeRow,
                {'value':value,'text':text});
        $incomeRow.find('.adultIncomeOftenBox').show();
        $addMore.find('.drop-select').html('Add another income resources...');
      }
    });

    $addMore.find('.fields').removeClass('fields');
    $addMore.find('.validation').removeClass('validation');
    $addMore.find('.valid').removeClass('valid').removeClass('required');
    $addMore.find('.drop-select').html('Add another income resources...');
    var $addMoreOption = $addMore.find('.drop-list option');
    var $addMoreOptionLen = $addMoreOption.length;
    $($addMoreOption[$addMoreOptionLen-1]).remove();
    $($addMoreOption[$addMoreOptionLen-2]).remove();
  },
  __adultIncomeInfoToScreen:function(cardId) {
    var that = this;
    that.infoToScreen(cardId);
    //show data
    var $screenCard = $('#cStep3-2');
    var $adultCards = $screenCard.find('.adult-card');
    var $amts = $adultCards.find('input[type=text]');
    _.each($amts,function(it){if ($(it).val()==0) $(it).val('');}); // amt 0 to empty
    _.each($adultCards,function(item,i){
      var withIncome = !_.isUndefined(that.gInfo['adults']['info'][i]) && !_.isUndefined(that.gInfo['adults']['info'][i]['withIncome'])?that.gInfo['adults']['info'][i]['withIncome']:0;

      var $noIncomeChk = $(item).find('.no-income input[type=checkbox]').first();
      var $incomeFields = $(item).find('.adultIncomeOftenBox .fields');
      var $incomeRows = $(item).find('.with-income');
      if (withIncome==0) {
        $noIncomeChk.attr('checked','checked');
        $incomeFields.removeClass('validation').removeClass('valid').removeClass('required');
      }
      else {
        $noIncomeChk.removeAttr('checked','checked');
        var info = that.gInfo['adults']['info'][i];
        _.each($incomeRows,function(incomeRow){
          var noData = true;
          var $incomeTypeRows = $(incomeRow).find('.adultIncomeOftenBox');
          _.each($incomeTypeRows,function(incomeTypeRow){
            var $amt = $(incomeTypeRow).find('input[type=text]').first();
            //no validation for empty
            if (_.isBlank($amt.val())) {
              _.each($(incomeTypeRow).find('.fields'),function(theItem){
                $(theItem).removeClass('validation').removeClass('valid').removeClass('required');
              });
            }
            else {
              noData = false;
            }
          });
          if (!noData) $(incomeRow).find('input[type=checkbox]').first().trigger('click');
        });
      }
    });
  },
  __adultIncomeEvents:function(){    // for checkbox,remove and first/last name
    this._debug('info','Entering __adultIncomeEvents...');
    var that = this;
    var cardId = 'cStep3-2';
    var $card = $('#'+cardId);
    var $adultCardsOuter = $('#adultCards');
    var $incomeChk = $card.find('.with-income input[type=checkbox]');
    var $noIncomeChk = $card.find('.no-income input[type=checkbox]');
    $noIncomeChk.click(function(){
      if ($(this).is(':checked')) {
        var $stepCard = $(this).closest('.card');
        var $adultCard = $(this).closest('.adult-card');
        var $oftenBoxes = $adultCard.find('.adultIncomeOftenBox');
        var $addMores = $adultCard.find('.add-more');
        var $incomeChk = $adultCard.find('.with-income input[type=checkbox]');
        var $fields = $oftenBoxes.find('.fields.validation');
        var adultIdx = parseInt($adultCard.data('idx'));
        $oftenBoxes.hide();
        $addMores.hide();
        $incomeChk.removeAttr('checked');
        $fields.removeClass('validation').removeClass('valid').removeClass('required');
        $stepCard.data('valid',1);
        if (that.gInfo['adults']['info'][adultIdx]!=null)
          that.gInfo['adults']['info'][adultIdx]['withIncome']=0;
      }
/*      else
        that._step3AdultIncomeValidation();*/
      that.setCardNextButton(cardId);
    });
    $incomeChk.click(function () {
      var $stepCard = $(this).closest('.card');
      var $adultCard = $(this).closest('.adult-card');
      var $incomeRow = $(this).closest('.with-income');
      var $incomeTypeRows = $incomeRow.find('.third-info');
      var $oftenBoxes = $incomeRow.find('.adultIncomeOftenBox');
      var $addMores = $incomeRow.find('.add-more');
      var $noIncomeChk = $adultCard.find('.no-income input[type=checkbox]').first();
      var $amtes = $oftenBoxes.find('input[type=text]');
      var $selects = $oftenBoxes.find('select');
      var adultIdx = parseInt($adultCard.data('idx'));
      var $incomeChks = $adultCard.find('.with-income input[type=checkbox]');
      if ($(this).is(':checked')) {
        if ($oftenBoxes.length==0) {
          that.__appendAdultIncomeTypeOften($incomeRow);
          that.__appendAdultIncomeTypeAddMore($incomeRow);
          $incomeTypeRows = $incomeRow.find('.third-info');
          $oftenBoxes = $incomeRow.find('.adultIncomeOftenBox');
          $addMores = $incomeRow.find('.add-more');
          $amtes = $oftenBoxes.find('input[type=text]');
          $selects = $oftenBoxes.find('select');
        }

        $oftenBoxes.show();
        $addMores.show();
        $amtes.addClass('validation');
        $selects.addClass('validation');
        $selects.closest('.dropdown').addClass('valid').addClass('required');
        $noIncomeChk.removeAttr('checked');
        $noIncomeChk.closest('.checkbox').hide();
        if (that.gInfo['adults']['info'][adultIdx]!=null)
          that.gInfo['adults']['info'][adultIdx]['withIncome']=1;
        that._step3AdultIncomeValidation($(this).closest('.third-info'));
      }
      else  {
        if ($oftenBoxes.length==0)
          $incomeRow.find('.add-more').remove();
        else {
          $incomeRow.find('.add-more').hide();
        }
        $oftenBoxes.hide();
        $amtes.removeClass('validation');
        $selects.removeClass('validation');
        $selects.closest('.dropdown').find('.drop-select').removeClass('valid').removeClass('required');
        //check if all not checked
        var allNotChecked = true;
        _.each($incomeChks,function(item){
          if ($(item).is(':checked')) allNotChecked = false;
        });
        if (allNotChecked) {
          $noIncomeChk.closest('.checkbox').show();
          $noIncomeChk.trigger('click');
        }
      }

      that.setCardNextButton(cardId);
    });
    $adultCardsOuter.find('a.action.remove').click(function (e) {
      e.preventDefault();
      var $o = $('<div class="popup warning"><a href="javascript:EAT._doRemoveAdultCard(\'' + $(this).closest('.adult-card').data('idx') + '\')"><b>Remove?</b></a></div>').css('left', ($(this).offset().left - 20) + 'px').css('top', ($(this).offset().top - 20) + 'px').appendTo($('body'));
    });

    $('.adult-name .fields').keyup(function () {
        that.setCardNextButton(cardId);
    })
        .blur(function (e) {
          that.setCardNextButton(cardId);
        });


  },
  __appendAdultIncomeTypeOften:function($incomeRow,options){
    this._debug('info','Entering __appendAdultIncomeTypeOften...');
    var that = this;
    var cardId = 'cStep3-2';
    if (options==null) {
      $incomeRow.append(that.emptyAdultIncomeOften.clone());
      that._setSpanValidClass($incomeRow);
    }
    else  {
      $incomeRow.find('.add-more').before(that.emptyAdultIncomeOften.clone());
      that._setSpanValidClass($incomeRow.closest('.third-info'));
    }
    var oftenBoxLen = $incomeRow.find('.third-info').length;
    var i = oftenBoxLen-1;
    var $incomeTypeRow =  $($incomeRow.find('.third-info')[oftenBoxLen-1]);
    var mOften = that._setOftenMap();
    var incomeType = $incomeRow.data('id');
    var mType = that._setIncomeTypeMap(incomeType);
    var $oftenDropdown = $incomeTypeRow.find('.often-list .dropdown').first();
    var $typeDropdown = $incomeTypeRow.find('.type-list .dropdown').first();
    $incomeTypeRow.data('idx',i);
    var id = $incomeRow.data('id');
    $typeDropdown.find('.drop-select').first().data('id','adults.info.'+id+'.'+i+'.type')
            .data('var',$typeDropdown.find('.drop-select').first().data('var') +'.'+id);
    $typeDropdown.find('.drop-list').first().data('id','adults.info.'+id+'.'+i+'.type');
    $incomeTypeRow.find('input[type=text]').first().data('id','adults.info.'+id+'.'+i+'.amt');
    $oftenDropdown.find('.drop-select').first().data('id','adults.info.'+id+'.'+i+'.often');
    $oftenDropdown.find('.drop-list').first().data('id','adults.info.'+id+'.'+i+'.often');

      $typeDropdown.jdropdown({
        options: mType,
        optionType: 'text',
        changeAction: function () {
          if ($typeDropdown.find('.drop-list').find(':selected').text().toLowerCase()=='remove'){
            that._doRemoveAdultIncome(
                    parseInt($incomeRow.closest('.adult-card').data('idx')),
                    $incomeRow,
                    parseInt($typeDropdown.closest('.third-info').data('idx'))
            )
          }
          that.setCardNextButton(cardId);
        }
      });

      $oftenDropdown.jdropdown({
        options: mOften,
        optionType: 'text',
        size: 4,
        changeAction: function () {
//          that._step3AdultIncomeValidation();
          that.setCardNextButton(cardId);
        }
      });
    if (options!=null) {     //for add more
      $typeDropdown.find('.drop-select').first().html(options['text']);
      $typeDropdown.find('.drop-list').first().val(options['value']);
    }

        var optionList = $typeDropdown.find('select option');
        var optionsListLen = optionList.length;
        if ($(optionList[optionsListLen-1])[0].text.toLowerCase()=='remove') {
          $(optionList[optionsListLen-1]).css('color','#0391d1');
        }
       $incomeTypeRow.find('input[type=text].fields').keyup(function () {
        if ($(this).hasClass('validation')) {
          that._step3AdultIncomeValidation($(this).closest('.third-info'));
        }
        that.setCardNextButton(cardId);
      })
              .blur(function (e) {
                if ($(this).hasClass('validation')) {
                  that._step3AdultIncomeValidation($(this).closest('.third-info'));
                }
                that.setCardNextButton(cardId);
              });
    that.setCardNextButton(cardId);

  } ,
  _setSpanValidClass:function($outer){
     $outer.find('drop-list.validation').closest('.dropdown').addClass('valid').addClass('required');
  },
  _initStep3KidIncome:function() {
    this._debug('info','entering _initStep3KidIncome...');
    var that = this;
    var cardId = 'cStep3-1';
    var $card = $('#'+cardId);
    var n = parseInt(this.gInfo['kids']['num']);
    var $kidIncomeOuter = $('#kidIncome');
    var mOften = that._setOftenMap();
    $kidIncomeOuter.empty();
    //add every kid income card
    _.times(n,function(){
      that.emptyKidIncome.clone().appendTo($kidIncomeOuter);
      that._setSpanValidClass($kidIncomeOuter);
    });
    _.defer(function() {
      _.each($('.kid-income'), function (item, i) {
        $(item).data('idx', i);
        var $h1 = $(item).find('h1').first();
        $h1.html(that.gInfo['kids']['info'][i]['childFirstName'] + '&nbsp;' + that.gInfo['kids']['info'][i]['childLastName']);
          _.each($('.with-income'), function (item) {
            var $incomeRow = $(item);
            var $incomeChk = $incomeRow.find('input[type=checkbox]').first();
            var $noIncomeChk = $incomeRow.closest('.kid-income').find('.no-income input[type=checkbox]').first();
            var $incomeOftenBox = $incomeRow.find('.incomeOftenBox').first();
            var $oftenDropdown = $incomeOftenBox.find('.dropdown').first();
            var $text = $incomeRow.find('input[tyep=text]');
            var id = $(item).data('id');
            $(item).find('.incomeOftenBox input[type=text]').first().data('id','kids.info.'+id+'.amt');
            $(item).find('.incomeOftenBox .drop-select').first().data('id','kids.info.'+id+'.often');
            $(item).find('.incomeOftenBox .drop-list').first().data('id','kids.info.'+id+'.often');
            $oftenDropdown.jdropdown({
              options: mOften,
              optionType: 'text',
              size: 4,
              changeAction: function () {
 //               that._step3KidIncomeValidation();
                that.setCardNextButton(cardId);
              }
            });

            //events
            $noIncomeChk.click(function(){
              if ($(this).is(':checked')) {
                var $kidBox = $(this).closest('.kid-income');
                var $oftenBoxs = $kidBox.find('.incomeOftenBox');
                var $incomeChk = $kidBox.find('.with-income input[type=checkbox]');
                $oftenBoxs.hide();
                $incomeChk.removeAttr('checked');
                $kidBox.find('.fields').removeClass('validation').removeClass('valid').removeClass('required');
                $card.data('valid',1);
                that.gInfo['kids']['info'][i]['withIncome']=0;
              }
              that._step3KidIncomeValidation();
              that.setCardNextButton(cardId);
            });
            $incomeChk.click(function (e) {
              var $oftenBox = $(this).closest('.with-income').find('.incomeOftenBox');
              var $noIncomeChk = $(this).closest('.kid-income').find('.no-income input[type=checkbox]').first();
              if ($(this).is(':checked')) {
                $oftenBox.show();
//                $oftenBox.find('input[type=text]').focus();
                $noIncomeChk.removeAttr('checked');
                $noIncomeChk.closest('.checkbox').hide();
                $oftenBox.find('input[type=text].fields').addClass('validation');
                $oftenBox.find('select.fields').addClass('validation');
                $oftenBox.find('.dropdown').addClass('valid').addClass('required');
                that.gInfo['kids']['info'][i]['withIncome']=1;
                that._tooltips($oftenBox);
              }
              else  {
                $oftenBox.hide();
                _.each($oftenBox.find('.fields'),function(theItem){
                  $(theItem).removeClass('validation').removeClass('valid').removeClass('required');
                });
                //check if all not checked
                var allNotChecked = true;
                _.each($card.find('.with-income input[type=checkbox]'),function(item){
                   if ($(item).is(':checked')) allNotChecked = false;
                });
                if (allNotChecked) {
                  $noIncomeChk.closest('.checkbox').show();
                  $noIncomeChk.trigger('click');
                }
              }
              that._step3KidIncomeValidation($oftenBox);
              that.setCardNextButton('cStep3-1');
              e.stopImmediatePropagation();
            });
            $incomeRow.find('.fields').keyup(function () {
              if ($(this).hasClass('validation')) {
                var $oftenBox = $(this).closest('.with-income').find('.incomeOftenBox');
                that._step3KidIncomeValidation($oftenBox);
              }
            })
                    .blur(function (e) {
                      if ($(this).hasClass('validation')) {
                        var $oftenBox = $(this).closest('.with-income').find('.incomeOftenBox');
                        that._step3KidIncomeValidation($oftenBox);
                      }
                    });
          });
      });

      that.infoToScreen(cardId);

      //show data
      var $amts = $card.find('input[type=text]');
      var kidIncomes = $card.find('.kid-income');
      _.each($amts,function(it){if ($(it).val()==0) $(it).val('');}); // amt 0 to empty
      _.each(kidIncomes,function(item,i){
        var withIncome = that.gInfo['kids']['info'][i]['withIncome'];
        var $noIncomeChk = $(item).find('.no-income input[type=checkbox]').first();
        if (withIncome==0) {
          $noIncomeChk.attr('checked','checked');
          $(item).find('.fields').removeClass('validation').removeClass('valid').removeClass('required');
        }
        else {
          $noIncomeChk.removeAttr('checked','checked');
          var info = that.gInfo['kids']['info'][i];
          _.each($(item).find('.with-income'),function(it){
            var $amt = $(it).find('input[type=text]').first();
            if (_.isBlank($amt.val())) {
              _.each($(it).find('.fields'),function(theItem){
                $(theItem).removeClass('validation').removeClass('valid').removeClass('required');
              });
            }
            else {
              $(it).find('input[type=checkbox]').first().trigger('click');
            }
          });
        }
      });

      $card.find('.btn.next').removeAttr('disabled');
      $.setCheckboxIdLabel($card);
    });
  },
  _step3KidIncomeValidation:function($outer){
    var $card = $('#cStep3-1');
    if ($outer==null) $outer=$card;
    var valid = 1;

    _.each($outer.find('input[type=text]'), function (item,i) {
      if ($(item).hasClass('validation'))
        if (!$.isNumeric($(item).val())) {
          valid = 0;
        }
    });
    $card.data('valid', valid);
    $outer.toggleClass('invalid-row',valid==0);
    this.setCardNextButton('cStep3-1');
  },
  _step3AdultIncomeValidation:function($outer){
    var $card = $('#cStep3-2');
    if ($outer==null) $outer=$card;
    var valid = 1;

    _.each($outer.find(' input[type=text]'), function (item) {
      if ($(item).hasClass('validation'))
        if (!$.isNumeric($(item).val())) {
          valid = 0;

        }
    });
    $card.data('valid', valid);
    $outer.toggleClass('invalid-row',valid==0);
    this.setCardNextButton('cStep3-2');
  },
  _doRemoveKidCard:function(cardIdx) {
    this.gInfo['kids']['num']=$('#kidsNumber').val()-1;
    this.gInfo['kids']['info'].splice(cardIdx,1);

    if (this.gInfo['kids']['num']==0) {
      $('#kidsNumber').val('');
      var $dropdown = $('#kidsNumber').closest('.dropdown').first();
      var $span = $dropdown.find('.drop-select').first();
      $span.html($span.data('defaulttext'));
      $dropdown.addClass('required').addClass('valid');
      this._restoreTitle($dropdown);
    }
    this.initCard('cStep1');

  },
  _doRemoveAdultCard:function(cardIdx) {
    this.gInfo['adults']['num']=$('#adultsNumber').val()-1;
    this.gInfo['adults']['info'].splice(cardIdx,1);
    if (this.gInfo['adults']['num']==0) {
      $('#adultsNumber').val('');
      var $dropdown = $('#adultsNumber').closest('.dropdown');
      var $span =$dropdown.find('.drop-select').first();
      $span.html($span.data('defaulttext'));
      $dropdown.addClass('required').addClass('valid');
      this._restoreTitle($dropdown);
    }
    this.initCard('cStep3-2');
  },
  _doRemoveAdultIncome:function(cardIdx,$incomeRow,incomeIdx) {
    var incomeName = $incomeRow.data('id');
    this.gInfo['adults']['info'][cardIdx][incomeName].splice(incomeIdx,1);
    $($incomeRow.find('.adultIncomeOftenBox')[incomeIdx]).remove();
    if ($incomeRow.find('.adultIncomeOftenBox').length==0) {
      $incomeRow.find('input[type=checkbox]').first().trigger('click');
    }
    else {
      var $thirdInfos = $incomeRow.find('.third-info');
      _.each($thirdInfos,function(item,i){
        $(item).data('idx',i);
      })

    }
  },
  _initStep1 : function() {
    this._debug('info','entering _initStep1...');
    var that = this;
    var cardId = 'cStep1';
    var $card = $('#'+cardId);
    var kidNum = parseInt(this.gInfo['kids']['num']);
    var $kidCardsOuter = $('#kidCards');
    var mEthnicity = that._setEthnicityMap();
    var mRace = that._setRaceMap();

    $kidCardsOuter.empty();
    if (kidNum>0) {
      for (var i = 0; i < kidNum; i++) {
        that.emptyKidCard.clone().appendTo($kidCardsOuter);
      }
      _.defer(function () {
        that._tooltips($('.kid-card'));
        _.each($('.kid-index'), function (item, i) {
          $(item).html(i + 1);
          $(item).closest('.kid-card').data('idx', i);

          var $kidCard = $(item).closest('.kid-card');
          var $ethnicity = $kidCard.find('.dropdown.ethnicity');
          var $race = $kidCard.find('.dropdown.race');
          _.each($ethnicity,function(item){
            $(item).jdropdown({
              options:mEthnicity,
              optionType:'text',
              size:3,
              changeAction:function() {
              }
            });
          });
          _.each($race,function(item){
            $(item).jdropdown({
              options:mRace,
              optionType:'text',
              multiple:true,
              changeAction:function() {
              }
            });
          });


        });


        //events
        $kidCardsOuter.find('.fields.validation').keyup(function () {
          that.setCardNextButton('cStep1');
        })
                .blur(function (e) {
                  that.setCardNextButton('cStep1');
                });
        $kidCardsOuter.find('a.action.remove').click(function (e) {
          e.preventDefault();
          var $o = $('<div class="popup warning"><a href="javascript:EAT._doRemoveKidCard(\'' + $(this).closest('.kid-card').data('idx') + '\')"><b>Remove?</b></a></div>').css('left', ($(this).offset().left - 20) + 'px').css('top', ($(this).offset().top - 20) + 'px').appendTo($('body'));
        });

        // fill data
        that.infoToScreen(cardId);
        // enable/disable next button
        that.setCardNextButton(cardId);
        $.setCheckboxIdLabel($card);
      });
 //     $card.find('input[type=text]').first().focus();

      $card.find('.btn-line').removeClass('w400');
      //that._setTabIndex(cardId);
    }
    else
      that.setCardNextButton(cardId);
  },
  _initStep3Skip:function(){
    this._debug('info','Entering _initStep3Skip...');
    var that = this;
    /* skip when isBenefit or all kids are homeless or foster */
    var skip = that.gInfo['isInBenefitProgram'] == 1;
    var cardId = 'cStep3';
    var $card = $('#'+cardId);
    var $ssnBox = $('#step3SSN');
    var $skipBox = $('#step3Skip');
    var $ssn = $ssnBox.find('input[type=text]');
    var $noSSNChk = $ssnBox.find('input[type=checkbox]').first();
    if  (!skip) {
      var kidsNum = that.gInfo['kids']['num'];
      var allHomeless = true;
      for (var i=0;i<kidsNum;i++)  {
        var info = that.gInfo['kids']['info'][i];
        if (info['isFoster']==0 && info['isHomeless']==0) allHomeless=false;
      }
      skip = allHomeless;
    }
    this.infoToScreen(cardId);
    this.isSkipIncome = skip;
    if (skip) {
      $skipBox.show();
      $ssnBox.hide();
      $ssn.removeClass('validation');
      $card.find('.next').data('nav','cStep4').removeAttr('disabled');
      that.setCardNextButton(cardId);
      $('body').addClass('skip-income');
  }
    else {
      $skipBox.hide();
      $ssnBox.show();
      if (that.gInfo['noSSN']==1) {
        $noSSNChk.removeAttr('checked');
        $noSSNChk.trigger('click');
        $('body').removeClass('skip-income');
      }
      else {
        $ssn.addClass('validation') ;
        this.setCardNextButton(cardId);
                //.focus();
        $card.find('.next').data('nav','cStep3-1').removeAttr('disabled');
      }
      $card.find('.next').data('nav','cStep3-1').removeAttr('disabled');
      $('body').removeClass('skip-income');
    }
  },
  // Safe console debug - http://klauzinski.com/javascript/safe-firebug-console-in-javascript
  _debug:function(m) {
    if (this.debug && typeof console === 'object' && (typeof m === 'object' || typeof console[m] === 'function')) {
      if (typeof m === 'object') {
        var args = [];
        for (var sMethod in m) {
          if (typeof console[sMethod] === 'function') {
            args = (m[sMethod].length) ? m[sMethod] : [m[sMethod]];
            console[sMethod].apply(console, args);
          } else {
            console.log.apply(console, args);
          }
        }
      } else {
        console[m].apply(console, Array.prototype.slice.call(arguments, 1));
      }
    }
  },
  displayCurrentCard : function() {
    var storageVal = $.storage(_storeCard);
    var cardId =_.isUndefined(storageVal)?'cWelcome':storageVal;
    this._changeCard(cardId);
  },
  changeCard : function($Btn) {
    var toCardId = $Btn.data('nav');
    var fromCardId = $Btn.parents('section').attr('id');
    this.toChangeCard(fromCardId,toCardId);
  },
  toChangeCard:function(fromCardId,toCardId) {
    this._changeCard(toCardId);
    if (this.saveInfo) {
      if (fromCardId=='cStep3') this.cleanStep3Skip();
      if (fromCardId=='cStep3-1') this.cleanStep3KidIncome();
      if (fromCardId=='cStep3-2') this.cleanStep3AdultIncome();
      this.screenToInfo(fromCardId );
    }
  },
  _changeCard : function(toCardId){
    var that = this;
    $('.card').removeClass('open');
    $('header aside li').removeClass('current');
    _.defer(function(){
      var $toCard = $('#'+toCardId);
      $toCard.addClass('open');
      //display steps bar on the top
      var step = $toCard.data('step');
      if (step!=null) {
        for (var i=1;i<=step;i++) {
          $('header aside li:nth-of-type('+i+')').addClass('current');
        }
 //       $('aside span').html('STEP '+step+' OF 4');
//        $('aside a').show();
      }
      else {
        $('header aside li').removeClass('current');
        $('aside span').empty();
//        $('aside a').hide();
      }
      if (that.saveInfo) {
        that.storageToInfo();
      }
      that.initCard(toCardId);
    });

    $.storage(_storeCard,toCardId);
    //focus
    if (!$('#'+toCardId).hasClass('no-focus')) {
      var $toCardFields = $('#'+toCardId+' .fields');
     /* if ($toCardFields.length>0) {
        _.defer(function(){
          $toCardFields.first().focus();
        });
      }*/
    }
    //scroll to top
    $("html, body").animate({
      scrollTop: 0
    }, 100);
  },
  _setVal : function(o,v){
    var that = this;
    if (o.prop('tagName').toLowerCase()=='span') {    //dropdown text
      if ($.isEmpty(v,0)) o.html(o.data('defaulttext'));
      else {
        if (o.data('type')!=null && o.data('type')=='text') {
          var varName = o.data('var');
          if (_.isArray(v)) {
            var s = '';
            for (var i=0;i< v.length;i++) {
              s+= eval('Constant.' + varName + '[' + (v[i] - 1) + ']')+', ';
            }
            o.html(s.substring(0, s.length-2));
          }
          else {
              o.html(eval('Constant.' + varName + '[' + (v - 1) + ']'));
          }
        }
        else if (o.data('type')!=null && o.data('type')=='text-array') {
          var varNames = o.data('var').split('.');
          o.html(eval('Constant.' + varNames[0] + '[\''+varNames[1]+'\'][' + (v - 1) + ']'));
        }
        else   {
          o.html(v);
        }
      }
    }
    else if (o.prop('type').toLowerCase()=='checkbox' && v==1) {
      o.attr('checked','checked');
    }
    else {
      o.val(v);
    }
  },
  _parseValue:function(value) {
    return _.isUndefined(value)?'':value;
  },
  screenToInfo : function(cardId) {
    this._debug('info','Entering screenToInfo...'+cardId);
    var that = this;
    _.each($('#'+cardId+' .fields'),function(item){
      var value = $(item).val();
      var tagName = $(item).prop('tagName').toLowerCase();
        if (tagName!='span') {
          if ($(item).prop('type') != null && $(item).prop('type').toLowerCase() == 'checkbox') {
            if ($(item).is(':checked')) value = 1;
            else value = 0;
          }
          var key = $(item).data('id');
          if (key.indexOf('.') > 0) { //second level, e.g. kids.num, kids.info.childFirstName
            var keyArr = key.split('.');
            var key0, key1, key2 = '', key3='',key4='',idx = 0;
            key0 = keyArr[0];  //e.g. kids
            key1 = keyArr[1];  // e.g. mum, info
            if (keyArr.length >=3) {
              key2 = keyArr[2];  // e.g. childFirstName
              var $subCard = $(item).closest('.sub-info');
              idx = parseInt($subCard.data('idx'));  // e.g. 0
              if (key1=='info' && _.isUndefined(that.gInfo[key0][key1][idx])) {
                if (idx==0) that.gInfo[key0][key1] = [];
                if (key0=='kids')
                  that.gInfo[key0][key1].push($.extend({}, that.emptyKidInfo));
                if (key0=='adults') {
                  that.gInfo[key0][key1].push($.extend({}, that.emptyAdultInfo));
                }
              }
              if (keyArr.length>=4) {  //e.g. kids.info.incomeSalary.amt
                if (keyArr.length==4) {
                  key3=keyArr[3];
                  if (value==null) value='';
                  that.gInfo[key0][key1][idx][key2][key3] = that._parseValue(value);
                }
                else {  //e.g adult income type .amt
                  key3=parseInt(keyArr[3]);
                  key4=keyArr[4];

                  if (that.gInfo[key0][key1][idx][key2]==null)
                    that.gInfo[key0][key1][idx][key2]=[];
                  var $key3 = that.gInfo[key0][key1][idx][key2][key3];
                  if ($.isEmpty($key3)) {
                    var m = {'type':0,'amt':0,'often':0};
//                    that.gInfo[key0][key1][idx][key2]=[];
                    that.gInfo[key0][key1][idx][key2].push(m);
                  }
                  that.gInfo[key0][key1][idx][key2][key3][key4] = that._parseValue(value);
                }
              }
              else {
                if (value==null) {
                  value = _.isArray(that.gInfo[key0][key1][idx][key2])?[]:'';
                }
                that.gInfo[key0][key1][idx][key2] = that._parseValue(value);
              }
            }
            else {
              that.gInfo[key0][key1] = that._parseValue(value);
            }
          }
          else {
            that.gInfo[key] = that._parseValue(value);
          }
        }
    });
//  this._gInfoToString();
    this.infoToStorage();
  },
  storageToInfo : function(){
    this._debug('info','Entering storageToInfo...');
    var that = this;
    _.map(that.gInfo,function(v,k){
      var val =$.storage(k);
      if (_.isObject(v)) {
        if (!_.isUndefined(val)) {
          if (val.indexOf(firstMapDivider)>-1) {
            var theMaps = val.split(firstMapDivider);
            that.gInfo[k]['num'] = theMaps[0].split(firstKeyValDivider)[1];
            var num = parseInt(_.isBlank(that.gInfo[k]['num']) ? 0 : that.gInfo[k]['num']);
            if (num > 0) {
              var arrRet = [];
              var arr = theMaps[1].split(firstKeyValDivider)[1];
              if (arr.indexOf(arrStart) > -1 && arr.indexOf(arrEnd) > -1) {
                arr = arr.substring(arrStart.length);
                arr = arr.substring(0, arr.length - arrEnd.length);
                arr = arr.split(arrDivider);
                _.each(arr, function (item) {
                  var mapRet = {};
                  var map = item.split(secMapDivider);  //childFirstName-John
                  _.each(map, function (mapItem) {
                    var vv = mapItem.split(secKeyValDivider);
                    if (vv[1].indexOf(thirdMapDivider)>-1) {
                      var thirdMapRet = {};
                      var thirdMap = vv[1].split(thirdMapDivider);
                      _.each(thirdMap, function (theMapItem) {
                        var vvv = theMapItem.split(thirdKeyValDivider);
                        thirdMapRet[vvv[0]]=vvv[1];
                      });
                      mapRet[vv[0]] = thirdMapRet;
                    }
                    else { //todo
                      if (vv[0]=='race') {
                        var raceArr = [];
                        if (!_.isBlank(vv[1])) {
                          if (vv[1].indexOf(thirdArrDivider)>-1) {
                            raceArr = vv[1].split(thirdArrDivider);
                          }
                          else {
                            raceArr.push(vv[1]);
                          }
                        }
                        mapRet[vv[0]] = raceArr;
                      }
                      else if (vv[0]=='work' || vv[0]=='military' || vv[0]=='assistance' || vv[0]=='retirement' || vv[0]=='otherAdultIncome') {
                        var typeArrRet = [];

                        if (!_.isBlank(vv[1])) {
                          if (vv[1].indexOf(thirdArrDivider)>-1) {
                            var typeArr = vv[1].split(thirdArrDivider);
                            for (var j=0;j<typeArr.length;j++) {
                              var nextMapRet = {};
                              var nextMap = typeArr[j].split(forthMapDivider);
                              _.each(nextMap, function (theMapItem) {
                                var theV = theMapItem.split(forthKeyValDivider);
                                nextMapRet[theV[0]]=theV[1];
                              });
                              typeArrRet.push(nextMapRet);

                            }
                          }
                          else {
                            var nextMapRet = {};
                            var nextMap = vv[1].split(forthMapDivider);
                            _.each(nextMap, function (theMapItem) {
                              var theV = theMapItem.split(forthKeyValDivider);
                              nextMapRet[theV[0]]=theV[1];
                            });
                            typeArrRet.push(nextMapRet);
                          }
                        }
                        mapRet[vv[0]] = typeArrRet;
                      }
                      else {
                        mapRet[vv[0]] = vv[1];
                      }
                    }
                  });
                  arrRet.push(mapRet);
                });
              }
              that.gInfo[k]['info'] = arrRet;
            }
          }
        }
      }
      else {
        that.gInfo[k] = val;
      }
    });

//    this._gInfoToString();
  },
  infoToScreen : function(cardId) {
    this._debug('info','Entering infoToScreen...');
    var that = this;
//   this._gInfoToString();
    _.each($('#'+cardId+' .fields'),function(item) {
      var key = $(item).data('id');
      if (key.indexOf('.') > 0) { //second level, e.g. kids.num, kids.info.childFirstName
        var keyArr = key.split('.');
        var key0, key1, key2 = '',key3='',key4='',idx = 0, subInfo = '';
        key0 = keyArr[0];  //e.g. kids
        key1 = keyArr[1];  // e.g. mum, info
//        console.log('key=..'+key);

        if (keyArr.length >= 3) {
          key2 = keyArr[2];  // e.g. childFirstName
          var $subCard = $(item).closest('.sub-info');
          var $subTypeCard = $(item).closest('.third-info');
          idx = parseInt($subCard.data('idx'));  // e.g. 0
          if (that.gInfo[key0][key1].length>0 && that.gInfo[key0][key1][idx]!=null)  {
            if (keyArr.length >= 4) {
              if (keyArr.length==4) {
                key3 = keyArr[3];  // e.g. amt
                that._setVal($(item), that.gInfo[key0][key1][idx][key2][key3]);
              }
              else {
                key3 = parseInt(keyArr[3]);  // it should be index: 0,1,2...
                key4 = keyArr[4];  // adult income with type
                if (that.gInfo[key0][key1][idx][key2][key3]!=null)
                  that._setVal($(item), that.gInfo[key0][key1][idx][key2][key3][key4]);
              }
            }
            else {
              that._setVal($(item), that.gInfo[key0][key1][idx][key2]);
            }
          }
        }
        else {
          that._setVal($(item), that.gInfo[key0][key1]);
        }
      }
      else {
        that._setVal($(item), that.gInfo[key]);
      }
    });
  },
  infoToStorage : function() {
    this._debug('info','Entering infoToStorage...');
//    this._gInfoToString();
    var that= this;
    _.map(that.gInfo,function(v,k){
      if (_.isObject(v)) {
        var s ='';
        _.map(v,function(vv,kk) {
          if (_.isArray(vv)) {
            s+=kk+firstKeyValDivider+arrStart;
            _.each(vv,function(item){
              _.map(item,function(vvv,kkk){
                if (_.isArray(vvv)) {
                  s += kkk + secKeyValDivider;
                  if (vvv.length>0) {
                    _.each(vvv, function (vvvv) {
                      if (_.isObject(vvvv)) {
                        _.map(vvvv,function(theV,theK){
                          s += theK + forthKeyValDivider+ theV + forthMapDivider;
                        });
                        s = s.substring(0, s.length - 1);
                        s += thirdArrDivider;
                      }
                      else
                        s += vvvv + thirdArrDivider;
                    });
                    s = s.substring(0, s.length - 1);
                  }
                  s+=secMapDivider;
                }
                else if (_.isObject(vvv)) {
                  s+=kkk+secKeyValDivider;
                  if (!$.isEmptyObject(vvv)) {
                    _.map(vvv, function (vvvv, kkkk) {
                      s += kkkk + thirdKeyValDivider + vvvv + thirdMapDivider;
                    });
                    s = s.substring(0, s.length - 1);
                  }
                  s+=secMapDivider;
                }
                else {
                  s+=kkk+secKeyValDivider+vvv+secMapDivider;
                }
              });
              s= s.substring(0, s.length-1);
              s+=arrDivider;
            });
            s= s.substring(0, s.length-1);
            s+=arrEnd;
          }
          else {
            s+=kk+firstKeyValDivider+vv+firstMapDivider;
          }
        });
        $.storage(k,s);
//        console.log(s);
      }
      else {
        $.storage(k,v);
      }
    });
  },
  _gInfoToString : function(){
    var that = this;
    _.map(that.gInfo,function(v,k){
      if (_.isObject(v)) {
        var s ='';
        _.map(v,function(vv,kk) {
          if (_.isArray(vv)) {
            s+=kk+firstKeyValDivider+arrStart;
            _.each(vv,function(item){
              _.map(item,function(vvv,kkk){
                if (_.isArray(vvv)) {
                  s+=kkk+secKeyValDivider;
                  if (vvv.length>0) {
                    _.each(vvv, function (vvvv) {
                      if (_.isObject(vvvv)) {
                        _.map(vvvv,function(theV,theK){
                          s += theK + forthKeyValDivider+ theV + forthMapDivider;
                        });
                        s = s.substring(0, s.length - 1);
                        s += thirdArrDivider;
                      }
                      else
                        s += vvvv + thirdArrDivider;
                    });
                    s = s.substring(0, s.length - 1);
                  }
                  s+=secMapDivider;
                }
                else if (_.isObject(vvv)) {
                  s+=kkk+secKeyValDivider;
                  if (!$.isEmptyObject(vvv)) {
                    _.map(vvv, function (vvvv, kkkk) {
                      s += kkkk + thirdKeyValDivider + vvvv + thirdMapDivider;
                    });
                    s = s.substring(0, s.length - 1);
                  }
                  s+=secMapDivider;
                }
                else {
                  s+=kkk+secKeyValDivider+vvv+secMapDivider;
                }
              });
              s= s.substring(0, s.length-1);
              s+=arrDivider;
            });
            s= s.substring(0, s.length-1);
            s+=arrEnd;
          }
          else {
            s+=kk+firstKeyValDivider+vv+firstMapDivider;
          }
        });
        that._debug('info','           gInfoToString sub-map k='+k+';s='+s);
      }
      else {
        that._debug('info','           gInfoToString k='+k+';v='+v);
      }
    });
  }

};


