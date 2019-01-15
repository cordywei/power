function _getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}
/*店铺id-微官网*/
var companyId = localStorage.getItem('companyId');
/*店铺Id-商城*/
var mallCompanyId = parseInt(localStorage.getItem('mallCompanyId'));
/*系统类型*/
var systemType = localStorage.getItem('systemType');
(function (w) {
    var _systemType = _getQueryString('systemType'); // 系统类型 mall商城 website官网 diancan点餐
    // 如果url中存在systemType，则用新的方法读取companyId、mallCompanyId并赋值
    if (_systemType) {
        var shopId = localStorage.getItem('ShopId-' + _systemType)
        if (shopId) {
            w.companyId = shopId
            w.mallCompanyId = parseInt(shopId)
        } else if (_systemType === 'mall') {
            w.companyId = w.mallCompanyId
        } else if (_systemType === 'website') {
            w.mallCompanyId = w.companyId
        }
        w.systemType = _systemType
    }
    w.orderType = Number(_getQueryString('orderType') || 1);
})(window)
var ENV_localDevelop = true || window.location.href.indexOf('localhost') != -1 || window.location.href.indexOf('192.168.0') != -1; // 发布时需要修改为false
//开发环境地址
var DevelopPath = [
    "http://www.ydxcx.net/admin/",  //0 上线后切换
    "http://test.ydxcx.net/admin/",  //1 测试后切换
    "http://192.168.0.32/admin/",/*2 万庆*/
    "http://192.168.0.145:8001/admin/",/*3 新超*/
    "http://192.168.0.191:8001/admin/",/*4 文超*/
    "http://192.168.0.154/admin/", /*5 王磊*/
][1]
var api = {
	/**
	 * 点餐ajax
	 * */
    ajaxDiancan: function (opt) {
    	let that = this;
        that.handleLogin(function () {
        	opt.type = 'POST';
            opt.data = opt.data || {};
            opt.data.sCode = localStorage.getItem('ShopCode-' + systemType);
            opt.fullUrl = getDomainName() + opt.url;
            opt.xhrFields = {
                withCredentials: false
            };
            opt.crossDomain = false;
            that.ajax(opt);
        });
    },
    /**
	 * ajaxPost提交
	 * */
    ajaxPost: function (opt) {
        opt.type = opt.type || 'POST';
        opt.dataType = opt.dataType || 'json';
        opt.contentType = opt.contentType || 'application/json;charset=UTF-8';
        this.ajax(opt);
    },
    /**
	 * 登录后ajaxPost
	 * */
    ajaxPostLogin: function (opt) {
        let that = this;
        that.handleLogin(function () {
            that.ajaxPost(opt);
        });
    },
    /**
    * 登录后ajaxGet
    * */
    ajaxGetLogin: function (opt) {
        let that = this;
        that.handleLogin(function () {
            that.ajax(opt);
        });
    },
    ajax: function (opt) {
        let data = opt.data || opt.SData || {};
        data.systemType = systemType;
        opt.data = opt.data || (opt.SData && JSON.stringify(opt.SData));
        opt.url = opt.fullUrl || (getRootPath() + opt.url);
        opt.xhrFields = {
            withCredentials: true
        };
        opt.crossDomain = true;
        opt.success = opt.success || function (result, status, xhr) {
            if (result.code === undefined) {
                if (typeof opt._success == "function") {
                    opt._success(result, status, xhr);
                }
            } else if (result.code == 0) {
                if (typeof opt._success == "function") {
                    opt._success(result, status, xhr);
                }
                api.Message.success(opt.msg);
            } else {
                api.Message.error(result.msg || "调用错误，请联系管理员！");
            }
        }
        opt.error = opt.error || function (xhr, status, error) {
            if (typeof opt._error == "function") {
                opt._error(xhr, status, error);
            }
            api.Message.error(error && error.message);
        }
        $.ajax(opt);
    },
    /**
	 * iview信息提示
	 * */
    Message: {
        success: function (config) {
            if ("object" == typeof iview) {
                if (config) {
                    iview.Message.success(config);
                }
            }
        },
        error: function (config) {
            if ("object" == typeof iview) {
                if (config) {
                    iview.Message.error(config);
                }
            }
        },
    },
	/**
	 * 是否登录处理
	 * */
    handleLogin: function (callBack) {
        var isLogin = getCookie('loginFlag') || ENV_localDevelop;
        if (isLogin) {
            if (typeof callBack == "function") {
                callBack();
            }
        } else {
            top.location.href = getRootPath() + 'login';
        }
    },
	/**
	 * 跳转页面
	 * isIframe：是否是iframe跳转，true是，false不是
	 * */
    toPage: function (obj, isIframe) {
        var href = $(obj).attr("data-href");
        if (isIframe) {
            var title = $(obj).attr("data-title"),
                href = $(obj).attr("data-href");
            iframeCloseModal();
            $("#iframe").attr("src", href);
            $(".yd_hd_title").html('店铺装修');
        } else {
            window.location.href = href;
        }
    },
	/**
	 * 获取URL参数
	 * name: 参数名称
	 * */
    getQueryString: _getQueryString,
	/*
     *@descrtiption取得目标iframe src所包含的参数
     *@param iframeId - 目标iframe的id
     *@param level 级别，parent 获取父级，其他：获取当前页iframe,不传默认获取父级iframe
     *@return Object 参数名值对，｛参数名:参数值,……｝
     */
    "getIframeParams": function (iframeId, level) {
        if (arguments.length == 1) { level = "parent" }
        var regexpParam = /\??([\w\d%]+)=([\w\d%]*)&?/g; /*分离参数的正则表达式*/
        var targetEle = null;
        if (level == "parent") {
            targetEle = window.parent.document.getElementById(iframeId);
        } else {
            targetEle = document.getElementById(iframeId);
        }
        var paramMap = null;
        if (!!targetEle) {
            var url = targetEle.src; //取得iframe的url
            var ret;
            paramMap = {};//初始化结果集
            //开始循环查找url中的参数，并以键值对形式放入结果集
            while ((ret = regexpParam.exec(url)) != null) {
                /*ret[1]是参数名，ret[2]是参数值*/
                paramMap[ret[1]] = ret[2];
            }
        }
        return paramMap; //返回结果集
    },
    /**
	 * 时间戳转为日期格式
	 * time: 时间戳，如1506505252
	 * */
    formatDate: function (time, format = 'yyyy-MM-dd hh:mm:ss') {
        var date = new Date(time);
        var year = date.getFullYear(),
            month = date.getMonth() + 1,//月份是从0开始的
            day = date.getDate(),
            hour = date.getHours(),
            min = date.getMinutes(),
            sec = date.getSeconds();
        var preArr = Array.apply(null, Array(10)).map(function (elem, index) {
            return '0' + index;
        });////开个长度为10的数组 格式为 00 01 02 03
        var newTime = format.replace(/yyyy/g, year)
            .replace(/MM/g, preArr[month] || month)
            .replace(/dd/g, preArr[day] || day)
            .replace(/hh/g, preArr[hour] || hour)
            .replace(/mm/g, preArr[min] || min)
            .replace(/ss/g, preArr[sec] || sec);
        return newTime;
    },
    //四舍五入保留2位小数（不够位数，则用0替补）
    keepTwoDecimalFull: function (num, Decimal = 2) {
        if (isNaN(num)) {
            return "0.00";
        }
        result = Math.round(num * 100) / 100;
        var strresult = result.toString();
        if (strresult.indexOf('.') < 0) {
            strresult = strresult + '.';
        }
        let index = strresult.indexOf('.');
        let Decimalcount = strresult.length - index - 1;
        for (let i = 0; i < Decimal - Decimalcount; i++) {
            strresult += "0";
        }
        return strresult;
    },
    /**
	 * @description 获取时间差
	 * @param {int} endTime 結束時間
	 */
    getTimeDiff: function (endTime) {
        var activityTime = { day: '00', hour: '00', minu: '00', secs: '00' },//初始化
            currentTime = Date.parse(new Date()),//当前时间
            timeDiff = (endTime - currentTime) / 1000,
            timeArr = [];
        var add0 = function (num) {
            return num < 10 ? '0' + num : num;
        }
        if (timeDiff > 0) {
            activityTime.day = Math.floor(timeDiff / 60 / 60 / 24);
            activityTime.hour = Math.floor((timeDiff - activityTime.day * 60 * 60 * 24) / 60 / 60);
            activityTime.minu = Math.floor((timeDiff - activityTime.day * 60 * 60 * 24 - activityTime.hour * 60 * 60) / 60);
            activityTime.secs = Math.floor(timeDiff - activityTime.day * 60 * 60 * 24 - activityTime.hour * 60 * 60 - activityTime.minu * 60);
            timeArr = [activityTime.day, activityTime.hour, activityTime.minu, activityTime.secs].map(add0);
            activityTime.day = timeArr[0];
            activityTime.hour = timeArr[1];
            activityTime.minu = timeArr[2];
            activityTime.secs = timeArr[3];
        }
        return activityTime;
    },
	/*
	 * @description 日期转换为时间戳
	 * @param formatDate：时间格式：年/月/日 时:分:秒
	 */
    timeStamp: function (t) {
        t = t.replace(/-/g, "/");
        var d = new Date(t);
        return d.getTime() / 1000;
    },
    /**
     * @function 加载中-弹框
     * @param {message} 加载时的提示信息
     * */
    showLoading: function (message) {
        var modalHtml = '<div class="loading_modal">' +
            '<div class="loading_box">' +
            '<img src="' + getRootPath() + 'v12_images/common/loading_modal.gif" />' +
            '<div>' + (message ? message : '加载中...') + '</div>' +
            '</div>' +
            '</div>';
        $("body", window.parent.document).append(modalHtml);
    },
    /**
     * @description 加载中-弹框-关闭
     * */
    closeLoading: function () {
        $(".loading_modal", window.parent.document).remove();
    },
    /**
	/**
	 * 弹框-显示
	 * title：提示header
	 * message: 弹框内容content
	 * btnArray: 按钮文字数组，如["取消", "确定"]，或者["确定"]，按钮文字可修改
	 * callback: 点击按钮时的回调函数
	 * param className {String} 样式名称，定义弹框样式
	 * param iframeType {String} iframe类型；main父级页面，iframe子级页面
	 * */
    showModal: function (message, opt, callback) {
        opt = opt || {};
        opt.title = opt.title || '提示';
        opt.btnArray = opt.btnArray || ["取消", "确定"];
        opt.className = opt.className || '';
        opt.iframeType = opt.iframeType || 'iframe';
        var modalHtml = '<div class="my-modal ' + opt.className + '">' +
            '<div class="my-modal-box">' +
            '<div class="my-modal-header">' + opt.title + '<i class="ico-close" onclick="api.closeModal()"></i></div>' +
            '<div class="my-modal-content">' +
            '<p class="my-modal-tip">' + (message ? message : "") + '</p>' +
            '</div>' +
            '<div class="my-modal-footer">';
        if (opt.btnArray.length == 2) {
            modalHtml += '<button class="btn btn-cancel" data-index="0">' + opt.btnArray[0] + '</button>' +
                '<button class="btn btn-confirm" data-index="1">' + opt.btnArray[1] + '</button>';
        } else {
            modalHtml += '<button class="btn btn-confirm data-index="1">' + opt.btnArray[0] + '</button>';
        }
        modalHtml += '</div>' +
            '</div>' +
            '</div>';
        if (opt.iframeType === 'main') {
            $("body").append(modalHtml);
            $(".my-modal .btn").bind("click", function () {
                var index = parseInt($(this).attr("data-index"));
                var e = {
                    index: index //0:取消；1：确定
                };
                if (e.index == 1 && typeof callback === 'function') {
                    callback(e); // 给callback赋值，callback是个函数变量
                } else {
                    api.closeModal();
                }
            });
        } else {
            $("body", window.parent.document).append(modalHtml);
            $(".my-modal .btn", window.parent.document).bind("click", function () {
                var index = parseInt($(this).attr("data-index"));
                var e = {
                    index: index //0:取消；1：确定
                };
                if (e.index == 1 && typeof callback === 'function') {
                    callback(e); // 给callback赋值，callback是个函数变量
                } else {
                    window.api.closeModal();
                }
            });
            $(".my-modal .ico-close", window.parent.document).bind('click', api.closeModal)
        }
    },
	/**
     * @description 弹框-关闭
     * */
    closeModal: function () {
        $(".my-modal", window.parent.document).remove();
        $(".my-modal").remove();
    },
    /**
     * 弹框提示
     * */
    showSpin: function (option) {
        iview.Spin.show({
            render: (h) => {
                return h('div', [
                    h('Icon', {
                        'class': 'spin-icon-load',
                        props: {
                            type: 'load-c',
                            size: 18
                        }
                    }),
                    h('div', option && option.content || '正在加载')
                ])
            }
        });
        setTimeout(() => {
            iview.Spin.hide();
        }, option && option.time || 10000);
    },
    /**
     * 弹框关闭
     * */
    hideSpin: function () {
        setTimeout(() => {
            iview.Spin.hide();
        }, 200);
    },
    "form": {
        /*
       * @description 获取表单 元素值
       * @param formID 获取该formID 下所有表单元素值
       * @注意：调用该方法后，从服务端获取数据需要 使用decodeURIComponent 进行解码
       * 例如：JSON.parse(decodeURIComponent(JSON.stringify(formVal)));
       */
        "get_form": function (formID) {
            var value = [];
            formID = formID.indexOf('#') >= 0 ? formID : '#' + formID + ''; //判断参数是否带有#
            //alert($(formID).find('input[type=checkbox]').length);
            $(formID).find('input').each(function (index) {
                var inp_type = this.type, sel_name = this.name;
                if (inp_type == 'text' || inp_type == 'hidden' || inp_type == 'password') {
                    value.push('"' + this.id + '":"' + encodeURIComponent(this.value) + '"');
                }
                if (inp_type == 'radio' || inp_type == 'checkbox') {
                    if ($(this).prop('checked')) {
                        value.push('"' + sel_name + '":"' + encodeURIComponent($("input[name='" + sel_name + "']:checked").val()) + '"');
                    }
                    //checkbox特殊处理
                    if (inp_type == 'checkbox') { //alert(this.name);
                        //遍历所有checkbox值
                        var params = [];
                        $(formID).find("input[name='" + sel_name + "']:checkbox").each(function () {
                            if (this.checked) {
                                params.push(this.value);
                            }
                        });
                        if (params.length == 0) {
                            var params_str = ''
                        } else {
                            var params_str = params.join(',');
                        }
                        value.push('"' + sel_name + '":"' + encodeURIComponent(params_str) + '"');
                    };
                };
            });
            $(formID).find('select').each(function () { //下拉
                value.push('"' + this.id + '":"' + encodeURIComponent($(this).find("option:selected").val()) + '"');
            });
            $(formID).find('textarea').each(function () { //多行文本
                value.push('"' + this.id + '":"' + encodeURIComponent($(this).val()) + '"');
            });
            return JSON.parse("{" + value.join(',') + "}"); //转换json格式
        },
        /*
         * @description 设置表单值，input type=text，hidden，textarea，radio 需要加上ID，radio，checkbox需要加上name，与服务端返回字段一致
         * @param formid 
         * @param clickArr 类型：数组，值为：字段，执行时以元素的ID为准，将需要点击的函数优先处理, clickArr['chargeMode_']，一般处理radio切换结构 <input type="radio" id="chargeMode_1" name="chargeMode"/>
         * @param level 级别，参数：（1）parent 获取父级，（2）currentPage：获取当前页表单,不传默认获取父级表单
         * 注1：checkbox:name命名规则：服务端字段_服务端返回的value值，例如：<input name="username_1" type="checkbox" value="1"/>
         * 注2:radio:ID命名规则：服务端字段_服务端返回的value值，例如：<input type="radio" name="username" id="username_1" value="1">
         */
        "set_form": function (formId, data, clickArr, level) {
            if (arguments.length == 2) {
                clickArr = [];
                level = "parent";
            } else if (arguments.length == 3) {
                level = "parent";
            }
            var targetEle = null;
            if (level == "parent") {/*取父级页面表单*/
                targetEle = window.parent.document
            } else {/*取子集页面表单*/
                targetEle = document;
            }
            if (typeof (data) != "object") {
                data = JSON.parse(data);
            }
            /*优先处理需要点击切换结构的元素*/
            if (clickArr.length > 0) {
                for (var item in data) {
                    for (var i = 0; i < clickArr.length; i++) {
                        if (item.indexOf(clickArr[i]) >= 0) {
                            targetEle.querySelector("#" + formId + " #" + item + "_" + data[item]).click();
                        }
                    }
                }
            }
            /*开始赋值*/
            for (var item in data) {
                var dmObj = targetEle.querySelector("#" + formId + " #" + item), elObj = null;
                if (dmObj != null && dmObj.tagName.toLocaleLowerCase() != "select" && dmObj.type != "checkbox" && dmObj.type != "radio") {
                    /*判断是否为JSON串*/
                    if (typeof (data[item]) !== "object" && Object.prototype.toString.call(data[item]).toLowerCase() !== '[object object]') {
                        dmObj.value = data[item].toString().replace(/\"/g, "");
                    } else {
                        dmObj.value = JSON.stringify(data[item]);
                    }
                } else {
                    elObj = targetEle.querySelector("#" + formId + " input[name='" + item + "']");
                    if (elObj != null) {
                        if (elObj.type == "checkbox") {/*checkbox情况为可多选*/
                            for (var i = 0; i < data[item].length; i++) {
                                targetEle.querySelector("#" + formId + " input[name='" + item + "_" + data[item][i] + "']").checked = true;
                            }
                        } else if (elObj.tagName.toLowerCase() == "select") {
                            for (var i = 0; i < elObj.options.length; i++) {
                                if (elObj.options[i].value == data[item]) {
                                    elObj.options[i].selected = true;
                                }
                            }
                        }
                    }
                }
            }
        },
        /* *
         * @description 错误提醒函数
         * @param obj:插入位置
         * @param errorInfo：错误信息
         * @param width:宽度，默认值：140px
         * @param top:相对位移，距离顶部位置，默认值：0
         * @param left:相对位移，距离左侧位置，默认值：85%
        */
        "errorTips": function (obj, errorInfo, width, top, left) {
            if (arguments.length == 2) { width = 140; top = 0; left = "85%" }
            obj.style.position = "relative";
            if (document.querySelector(".dialog_error") != null) {
                document.querySelector(".dialog_error").outerHTML = "";
            }
            if (errorInfo == "") { errorInfo = "此处不能为空！" }
            var html = document.createElement("div");
            html.className = "dialog_error ue_animation ue_shake";
            html.style.width = width + "px";
            html.style.top = top + "px";
            html.style.left = left;
            html.innerHTML = errorInfo;
            obj.appendChild(html);
            if (html != null) {
                var t = setTimeout(function () {
                    if (obj.querySelector(".dialog_error") != null) {
                        $(html).remove();
                    }
                }, 5000);
            }
        }
    },
	/**
	 * 提示框-显示
	 * status: 状态值'success'操作成功；'fail'操作失败
	 * message: 提示信息
	 * time: 时间间隔
	 * */
    showToast: function (status, message, time) {
        var toastHtml = '<div class="my-toast my-toast-' + (status ? status : 'success') + '">' +
            '<i class="ico-close-1" onclick="api.closeToast()"></i>' +
            '<img src="' + getRootPath() + 'v12_images/website/icon_' + (status ? status : 'success') + '.png" />' + (message ? message : '操作成功') +
            '</div>';
        $("body").append(toastHtml);
        setTimeout(function () {
            api.closeToast();
        }, (time ? time : 2000));
    },
	/**
	 * 提示框-关闭
	 * */
    closeToast: function () {
        $(".my-toast").remove();
    },
	/**
	 * 显示地图
	 * isLocation: 是否定位，true否，false是
	 * fulladdress： 地址
	 * */
    showMap: function (isLocation, fulladdress) {
        if (!isLocation) {
            var province = $("#province").val();
            var city = $("#city").val();
            var district = $("#district").val();
            var address = $("#address").val();
            fulladdress = province + city + district + address;
            // 将地址解析结果显示在地图上,并调整地图视野
            myGeo.getPoint(fulladdress, function (point) {
                if (point) {
                    map.centerAndZoom(point, 16);
                    map.clearOverlays();
                    map.addOverlay(new BMap.Marker(point));
                } else {
                    console.log("您选择地址没有解析到结果!")
                };
            }, province);
        }
    },
	/**
	 * 吸色器
	 * */
    colorTrap: function () {
        $(".setColor").on("click", function () {
            $(this).parent().parent().find(".colortrap").focus();
        });
        $(".colortrap").each(function () {
            var $that = $(this);
            $(this).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'top right',
                change: function (hex, opacity) {
                    var log;
                    try {
                        log = hex ? hex : 'transparent';
                        if (opacity) log += ', ' + opacity;
                        $.each(shopDec.list, function (i, item) {
                            if (item.sort == drag.current_sort) {
                                var currentColor = parseInt($that.attr("data-color"));
                                if (currentColor == 1) {
                                    item.backgroundColor = log;
                                    $(".show_content .selected_component").css({
                                        'background-color': log
                                    });
                                } else if (currentColor == 2) {
                                    item.titleColor = log;
                                    $(".show_content .selected_component").find("span").css({
                                        'color': log
                                    });
                                } else if (currentColor == 3) {
                                    item.titleSelectedColor = log;
                                }
                            }
                        });
                    } catch (e) { }
                },
                theme: 'default'
            });
        });
    },
    /**
     * 上传图片
     * uploadId: name=file input框的Id值
     * successCallback: 成功回调
     * errorCallback: 失败回调
     * @param {Boolean} uploadWxPicture 是否是上传微信图片
     * */
    upload: function (obj, uploadId, type, successCallback, errorCallback, completeCallback, uploadWxPicture) {
        this.handleLogin(function () {
            var filepath = $("#" + uploadId).val();
            if (!filepath) {
                return false;
            }
            api.showLoading('正在上传...');
            //检查是否为图片
            if (!api.validateFormat(filepath, ['.PNG', '.JPG', '.JPEG'], "图片只能是png,jpeg,jpg格式喔")) {
                api.closeLoading();
                return false;
            }
            //检查是否
            if (!api.checkFileSize(filepath, uploadId)) {
                api.closeLoading();
                return false;
            }
            if ($("#" + uploadId).val() != "") {
                var fileToUpload = "#" + uploadId;
                var urlPath = getRootPath();
                jQuery.ajaxSettings.traditional = true;
                $.ajaxFileUpload({
                    url: urlPath + 'upload/uploadPic',//处理上传用的后台程序
                    secureuri: false,//异步
                    fileElementId: uploadId,//上传控件ID
                    dataType: 'json',//返回的数据信息格式
                    type: 'POST',
                    contentType: 'multipart/form-data',
                    data: { 'fileToUpload': fileToUpload, uploadWxPicture: uploadWxPicture },
                    //			        async: false,
                    success: successCallback,
                    error: errorCallback,
                    complete: function () {
                        $('#' + uploadId).val('');//重置input file的value值，避免onchange事件对重复上传同一张图片无效
                    }
                });
            }
        });
    },
	/**
     * 上传图片
     * uploadId: name=file input框的Id值
     * successCallback: 成功回调
     * errorCallback: 失败回调
     * */
    uploadVedio: function (obj, uploadId, type, successCallback, errorCallback) {
        var filepath = $("#" + uploadId).val();
        api.showLoading('正在上传...');
        //检查是否为视频
        if (!api.validateFormat(filepath, ['.MP4'], "视频只能是mp4格式喔")) {
            api.closeLoading();
            return false;
        }
        //检查是否
        if (!api.checkFileSize(filepath, uploadId, 50, "上传的视频不能超过50M喔！！！")) {
            api.closeLoading();
            return false;
        }
        if ($("#" + uploadId).val() != "") {
            var fileToUpload = "#" + uploadId;
            var urlPath = getRootPath();
            jQuery.ajaxSettings.traditional = true;
            $.ajaxFileUpload({
                url: urlPath + 'upload/uploadVideo',//处理上传用的后台程序
                secureuri: false,//异步
                fileElementId: uploadId,//上传控件ID
                dataType: 'json',//返回的数据信息格式
                type: 'POST',
                contentType: 'multipart/form-data',
                data: { 'fileToUpload': fileToUpload },
                async: false,
                success: successCallback,
                error: errorCallback
            });
        }
    },
    /**
     * h5上传图片
     * @param {Boolean} uploadWxPicture 是否是上传微信图片
     * */
    h5upload: function (uploadId, uploadComplete, uploadFailed) {
        this.handleLogin(function () {
            var xhr = new XMLHttpRequest();
            var filepath = $("#" + uploadId).val();
            if (!filepath) {
                return false;
            }
            api.showLoading('正在上传...');
            //检查是否为图片
            if (!api.validateFormat(filepath, ['.PNG', '.JPG', '.JPEG'], "图片只能是png,jpeg,jpg格式喔")) {
                api.closeLoading();
                return false;
            }
            //检查是否
            if (!api.checkFileSize(filepath, uploadId)) {
                api.closeLoading();
                return false;
            }
            if ($("#" + uploadId).val() != "") {
                var fileToUpload = "#" + uploadId;
                var urlPath = getRootPath();
                var fd = new FormData();
                //关联表单数据,可以是自定义参数
                fd.append("fileUpload", document.getElementById(uploadId).files[0]);
                fd.append("fileToUpload", fileToUpload);
                fd.append("uploadWxPicture", fileToUpload);
                //监听事件
                //xhr.upload.addEventListener("progress", uploadProgress, false);
                xhr.addEventListener("load", uploadComplete, false);
                xhr.addEventListener("error", uploadFailed, false);
                //xhr.addEventListener("abort", uploadCanceled, false);
                //发送文件和表单自定义参数
                xhr.open("POST", urlPath + "upload/uploadPic", true);
                xhr.send(fd);
            }
        });
    },
    /**
     * @description 上传图片
     * */
    uploadImgH5: function (e, callback) {
        var that = this, uploadId = e.target.id;
        this.h5upload(uploadId,
            function (xhr) {
                if (xhr.currentTarget.status == 200) {
                    var data = JSON.parse(xhr.currentTarget.response);
                    if (data.code == 0) {
                        if (callback) {
                            callback(data);
                        }
                    } else {
                        api.showToast("fail", "上传失败");
                    }
                    $(".upload_input").val("")
                } else {
                    api.showToast("fail", "上传失败");
                }
                api.closeLoading();
            },
            function (xhr) {
                $(".upload_input").val("")
                api.closeLoading();
            });
    },
    /**
     * 上传视频
     * uploadId: name=file input框的Id值
     * successCallback: 成功回调
     * errorCallback: 失败回调
     * */
    uploadVedioH5: function (uploadId, uploadComplete, uploadFailed) {
        this.handleLogin(function () {
            var xhr = new XMLHttpRequest();
            var filepath = $("#" + uploadId).val();
            api.showLoading('正在上传...');
            //检查是否为视频
            if (!api.validateFormat(filepath, ['.MP4'], "视频只能是mp4格式喔")) {
                api.closeLoading();
                return false;
            }
            //检查是否
            if (!api.checkFileSize(filepath, uploadId, 10, "上传的视频不能超过10M喔！！！")) {
                api.closeLoading();
                return false;
            }
            if ($("#" + uploadId).val() != "") {
                var fileToUpload = "#" + uploadId;
                var urlPath = getRootPath();
                var fd = new FormData();
                //关联表单数据,可以是自定义参数
                fd.append("fileUpload", document.getElementById(uploadId).files[0]);
                fd.append("fileToUpload", fileToUpload);
                fd.append("uploadWxPicture", fileToUpload);
                //监听事件
                //xhr.upload.addEventListener("progress", uploadProgress, false);
                xhr.addEventListener("load", uploadComplete, false);
                xhr.addEventListener("error", uploadFailed, false);
                //xhr.addEventListener("abort", uploadCanceled, false);
                //发送文件和表单自定义参数
                xhr.open("POST", urlPath + "upload/uploadVideo", true);
                xhr.send(fd);
            }
        });
    },
	/**
	 * 文件上传
	 * 
	 * */
    fileUpload: function (option) {
        if (typeof XMLHttpRequest === 'undefined') {
            return;
        }
        const xhr = new XMLHttpRequest();
        if (xhr.upload) {
            xhr.upload.onprogress = function progress(e) {
                if (e.total > 0) {
                    e.percent = e.loaded / e.total * 100;
                }
                if (typeof option.onProgress == "function") {
                    option.onProgress(e);
                }
            };
        }
        xhr.onerror = function error(e) {
            if (typeof option.onError == "function") {
                option.onError(e);
            }
        };
        xhr.onload = function onload() {
            if (xhr.status == 200) {
                if (typeof option.onSuccess == "function") {
                    option.onSuccess(xhr);
                }
            } else {
                if (typeof option.onError == "function") {
                    option.onError(xhr);
                }
            }
        };
        if (option.withCredentials && 'withCredentials' in xhr) {
            xhr.withCredentials = true;
        }
        let headers = option.headers || {};
        for (let item in headers) {
            xhr.setRequestHeader(item, headers[item]);
        }
        xhr.open('post', option.action, true);
        let formData = new FormData();
        if (option.data) {
            Object.keys(option.data).map(key => {
                formData.append(key, option.data[key]);
            });
        }
        formData.append(option.filename, option.file);
        xhr.send(formData);
    },
    /**
	 *  验证文件格式
	 * @param Suffix 后缀
     * @param message 提示信息
	 * */
    validateFormat: function (filepath, Suffix, message) {
        var extStart = filepath.lastIndexOf(".");
        var ext = filepath.substring(extStart, filepath.length).toUpperCase();
        if (!Suffix.includes(ext)) {
            api.showModal(message);
            return false;
        }
        return true;
    },
    /* 检查图片大小，不能超过3M,支持IE、filefox、chrome */
    checkFileSize: function (filepath, uploadId, size, message) {
        var maxsize = 1 * 1024 * 1024;//1M
        var errMsg = "上传的图片不能超过1M喔！！！";
        var tipMsg = "您的浏览器暂不支持上传头像，确保上传文件不要超过1M，建议使用IE、FireFox、Chrome浏览器。";
        if (size) {
            maxsize = maxsize * size;
        }
        if (message) {
            errMsg = message;
        }
        try {
            var filesize = 0;
            var ua = window.navigator.userAgent;
            if (ua.indexOf("MSIE") >= 1) {
                //IE
                var img = new Image();
                img.src = filepath;
                filesize = img.fileSize;
            } else {
                filesize = $("#" + uploadId)[0].files[0].size; //byte
            }
            if (filesize > 0 && filesize > maxsize) {
                api.showModal(errMsg);
                return false;
            } else if (filesize == -1) {
                api.showModal(tipMsg);
                return false;
            }
        } catch (e) {
            api.showModal("图片上传失败，请重试");
            return false;
        }
        return true;
    },
	/**
	 * 删除上传图片
	 * type: 1单张图片上传；2多张图片上传
	 * */
    deleteThisImg: function (obj, type) {
        if (type == 1) {
            $("#logoImg").val('');
            $(obj).parent().remove();
            $(".upload-box2").css("visibility", "visible")
        } else {
            var imgPath = $(obj).attr("data-path");
            $(obj).parent().remove();
            bannerArr.splice($.inArray(imgPath, bannerArr), 1);
            $("#bannerImg").val(bannerArr.join(","));
            $(".upload-box1").css("visibility", "visible")
        }
    },
	/**
	 * js过滤HTML标签以及空格
	 * */
    removeHTMLTag: function (str) {
        str = str.replace(/<\/?[^>]*>/g, ''); //去除HTML tag
        str = str.replace(/[ | ]*\n/g, '\n'); //去除行尾空白
        //str = str.replace(/\n[\s| | ]*\r/g,'\n'); //去除多余空行
        str = str.replace(/ /ig, '');//去掉 
        return str;
    },
    /**
	* js限制字数
	* nMax:最大字数
	* */
    checknum: function (obj, nMax) {
        var len = obj.value.length;
        if (len > nMax) {
            obj.value = obj.value.substring(0, nMax);
            return;
        }
    },
	/**
	 * 图片验证码倒计时 
	 * countTime 时隔，例120秒
	 * */
    countdown: function (time) {
        if (time == 0) {
            $('.code-img').attr("src", getRootPath() + "captcha?timestamp=" + (new Date()).valueOf());
            time = 120;
            api.countdown(time);
        } else {
            time--;
            setTimeout(function () {
                api.countdown(time);
            }, 1000)
        }
    },
	/**
	 * @description 实现将项目的图片转化成base64
	 * @param imgSrc {String} 图片路径
	 * */
    convertImgToBase64: function (imgSrc) {
        var canvas = document.createElement("canvas"),
            image = new Image();
        image.src = imgSrc;
        image.crossOrigin = '*';
        canvas.width = image.width;
        canvas.height = image.height;
        console.log(canvas.width + "|" + canvas.height);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);
        var ext = image.src.substring(image.src.lastIndexOf(".") + 1).toLowerCase();
        var dataURL = canvas.toDataURL("image/" + ext);
        return dataURL;
    },
    /**
     * @description “标签模板”的一个重要应用，就是过滤 HTML 字符串，防止用户输入恶意内容。
     * @param {string} templateData HTML内容
     * */
    saferHTML: function (templateData) {
        let s = templateData.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        return s;
    }
}
/**
 * ueditor配置
 * */
var ueditorConfig = {
    toolbars: [
        [
            'source', '|', 'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
            'indent', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
            'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            'simpleupload', '|',
            'horizontal', 'date', 'time', 'spechars', '|',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'fullscreen'
        ]
    ],
    elementPathEnabled: false,//不显示元素路径
    wordCount: false,          //是否开启字数统计
    initialFrameWidth: '100%',
    initialFrameHeight: 300,
    initialContent: '',
    autoClearinitialContent: true,
    autoHeightEnabled: false
}
/**
 * ueditor配置
 * */
var simpleueditorConfig = {
    toolbars: [
        [
            'source', '|', 'undo', 'redo', '|', 'link',
            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
            'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            'simpleupload', '|',
            'indent', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
        ]
    ],
    maximumWords: 5000, //允许的最大字符数
    enableAutoSave: false,
    elementPathEnabled: false,//不显示元素路径
    wordCount: false,          //是否开启字数统计
    initialFrameHeight: 400,
    initialContent: '',
    autoHeightEnabled: false
}
/*
 * @description input 输入框实时监控输入值
 * @param obj 监控对象
 * @param isDouble Boolean值，默认不传则为false;isDouble:true 支持小数点后两位，false，正整数
 * @param num int类型，小数位数，默认不传则为2
 * @example 
 * <input oninput="propertychange(this);" onpropertychange="propertychange(this);">
 */
function propertychange(obj, isDouble, num) {
    //	var regx = /^[1-9]\d*|0$/;//非负整数
    if (arguments.length <= 1) { isDouble = false; }
    if (!num) {
        num = 2;
    }
    //判断输入不为数字及小数点个数
    if (isDouble) {
        obj.value = obj.value.replace(/[^\d*\.]/g, '');
        var splitArr = obj.value.split('.');
        if (splitArr.length > num) {
            obj.value = splitArr[0] + '.' + splitArr[1];
        }
        /*只取小数点后两位*/
        if (splitArr[1] != undefined && splitArr[1].length > num) {
            if (splitArr[0] != "") {
                obj.value = splitArr[0] + '.' + splitArr[1].substring(0, num);
            } else {
                obj.value = '0.' + splitArr[1].substring(0, num);
            }
        }
    } else {
        obj.value = obj.value.replace(/[^\d]/g, '');
        if (obj.value < 0) {
            obj.value = 0;
        }
    }
}
/**
 * @description 失去焦点时，校验数字合法性
 * @example 
 * <input onblur="checkLegalSpec(this)">
 * */
function checkLegalSpec(obj) {
    if (obj.value != "") {
        obj.value = parseFloat(obj.value);
    }
}
/**
 * @方法描述 取得工程当前的路径
 * @创建作者 wangxinchao
 * @方法入参
 * @返回值
 * @创建日期 2017/9/28
 */
function getRootPath() {
    return ENV_localDevelop ? DevelopPath : (window.document.location.origin + "/admin/");
}
/**
 * @description 取得当前项目的域名
 * */
function getDomainName() {
    return ENV_localDevelop ? DevelopPath : (window.document.location.origin + "/");
}
// $("body").click(function () {
//     $(".main-account-right", parent.document).removeClass("open");
// });
/**
 * @description 获取cookie
 * @param name 
 * */
function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
(function (e) {
    const _Count = Symbol("Count");
    const _MaxCount = Symbol("MaxCount");
    const _TimeSpace = Symbol("TimeSpace");
    const _CallBack = Symbol("CallBack");
    const _Basis = Symbol("Basis");
    const _ExecFunc = Symbol("ExecFunc");
    let Timeout = null;
    function MonitorExecute(Basis, CallBack, MaxCount, TimeSpace) {
        if (typeof Basis != "function") {
            throw "ME-未设置监听值函数";
        }
        if (typeof CallBack != "function") {
            throw "ME-没有回调函数";
        }
        if (MaxCount) {
            if (isNaN(Number(MaxCount))) {
                MaxCount = 100000;
            }
            if (Number(MaxCount) < 1 || Number(MaxCount) > 100000) {
                MaxCount = 100000;
            }
        }
        if (TimeSpace) {
            if (isNaN(Number(TimeSpace))) {
                TimeSpace = 100;
            }
            if (Number(TimeSpace) < 1 || Number(TimeSpace) > 10000) {
                TimeSpace = 10000;
            }
        }
        this[_Count] = 0;
        this[_MaxCount] = MaxCount || 100000;
        this[_TimeSpace] = TimeSpace || 100;
        this[_CallBack] = CallBack;
        this[_Basis] = Basis;
        this[_ExecFunc]();
    }
    MonitorExecute.prototype[_ExecFunc] = function () {
        let that = this;
        if (this[_Count] < this[_MaxCount]) {
            this[_Count]++;
            if (this[_Basis]() == true) {
                this[_CallBack]();
                delete this;
            } else {
                console.log(1);
                Timeout = setTimeout(function () {
                    that[_ExecFunc]()
                }, this[_TimeSpace]);
            }
        }
    }
    e.ME = MonitorExecute;
})(window);
/**
 * @description 字符串去除空格
 * @example str.trim()
 * */
String.prototype.trim = function () {
    var str = this,
        str = str.replace(/^\s\s*/, ''),
        ws = /\s/,
        i = str.length;
    while (ws.test(str.charAt(--i)));
    return str.slice(0, i + 1);
}

/**
 * @description 字符串长度
 * @example str.trim()
 * */
String.prototype.gblen = function () {
    var len = 0;
    for (var i = 0; i < this.length; i++) {
        if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {
            len += 2;
        } else {
            len++;
        }
    }
    return len;
}   

/**
 * @description 异步加载 腾讯地图JavaScript API：
 * */
function init() {
 	console.log('腾讯地图初始化成功');
}
//异步加载地图库函数文件
function loadScript() {
	var mapKey = localStorage.getItem('mapKey');
  //创建script标签
  var script = document.createElement("script");
  //设置标签的type属性
  script.type = "text/javascript";
  //设置标签的链接地址
  script.src = 'https://map.qq.com/api/js?v=2.exp&key=' + mapKey + '&callback=init';
  //添加标签到dom
  document.body.appendChild(script);
}

