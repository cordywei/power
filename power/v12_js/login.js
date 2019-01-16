new Vue({
	el: "#login",
	data() {
		const validateID = function(rule, value, callback) {
			if(value === "") {
				callback(new Error('请输入您的账号！'));
			} else {
				callback();
			}
		};
		const validatCode = function(rule, value, callback) {
			if(value === "") {
				callback(new Error('请输入您的密码！'));
			} else {
				callback();
			}
		};
		const valiDateVerifyCode = function(rule, value, callback) {
			if(value === "") {
				callback(new Error('请输入您的验证码！'));
			} else {
				callback();
			}
		};
		return {
			loginValidate: {
				name: "",
				password: "",
				randomCode: ""
			},
			ruleValidate: {
				name: [{
					validator: validateID,
					trigger: 'blur'
				}],
				password: [{
					validator: validatCode,
					trigger: 'blur'
				}],
				randomCode: [{
					validator: valiDateVerifyCode,
					trigger: 'blur'
				}]
			},
			verifyImg: "../v12_images/footer_logo.png",
			timeInter: 60,
			DevelopPath: [
				"http://www.ydxcx.net/admin/", //0 上线后切换
				"http://test.ydxcx.net/admin/", //1 测试后切换
				"http://192.168.0.32/admin/", /*2 万庆*/
				"http://192.168.0.145:8001/admin/", /*3 新超*/
				"http://192.168.0.191:8001/admin/", /*4 文超*/
				"http://192.168.0.154/admin/", /*5 王磊*/
			][1],
			remember: false
		}
	},
	created: function() {
		let that = this;
		
		this.verifyImg = that.getRootPath() + "captcha?timestamp=" + (new Date()).valueOf();
		setInterval(function() {
			that.timeInter--;
			if(that.timeInter === 0) {
				that.timeInter = 60;
				that.verifyImg = that.getRootPath() + "captcha?timestamp=" + (new Date()).valueOf();
			}
		}, 1000);
								
		let cookieName = this.getCookie("name");
		let cookiePassword = this.getCookie("password");
		if(cookieName && cookiePassword){
			this.loginValidate.name = cookieName;
			this.loginValidate.password = cookiePassword;
			this.remember = true;
		};	
		
		console.log(this.getCookie("name"))
		console.log(this.getCookie("password"))
		console.log(document.cookie)
	},
	mounted() {
		
	},
	methods: {
		/**
		 * @param name 表单名称ref
		 * 
		 */
		canLogin(name) {
			let that = this;
			let formData = this.loginValidate;
			this.$refs[name].validate((valid) => {
				if(valid) {
					axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
					axios.defaults.withCredentials = true;
					axios.post("http://test.ydxcx.net/admin/loginAjax", formData).then((res) => {
						console.log(formData, res);
						if(res.data.status === "0") {
							this.$Message.error({
								render: h => {
									return h('span', [
										res.data.msg + "请重新输入！"
									]);
								},
								duration: 3
							});
						} else if(res.data.code === 3) {
							this.$Message.error({
								render: h => {
									return h('span', [
										res.data.msg + "请重新输入！"
									]);
								},
								duration: 3
							});
						} else if(res.data.status === "1") {
							window.location = "www.baidu.com"
						}
					}).catch((res) => {
						console.log(res)
					})
				}
			})
		},
		changeVerifyImg: function() {
			this.verifyImg = this.getRootPath() + "captcha?timestamp=" + (new Date()).valueOf();
		},
		ENV_localDevelop: function() {
			return true || window.location.href.indexOf('localhost') != -1 || window.location.href.indexOf('192.168.0') != -1; // 发布时需要修改为false       
		},
		getRootPath: function() {
			return this.ENV_localDevelop ? this.DevelopPath : (window.document.location.origin + "/admin/");
		},
		hrefTo: function() {
			window.location = "http://www.baidu.com";
		},
		rememberCode(res){
			this.remember = !this.remember;
			if(this.remember){
				if(this.loginValidate.name && this.loginValidate.password){
					this.setCookie("name",this.loginValidate.name,7);
					this.setCookie("password",this.loginValidate.password,7);
				}
			}else{
				this.setCookie("name","",-1);
				this.setCookie("password","",-1);
			}
		},
		// 设置cookie
		setCookie: function(cname, cvalue, exdays) {
			let date = new Date();
			date.setTime(date.getTime() + (exdays * 24 * 60 * 60 * 1000));
			let expires = "expires=" + date.toUTCString();
			console.info(cname + "=" + cvalue + ";" + expires);
			document.cookie = cname + "=" + cvalue + ";" + expires;
			console.info(document.cookie);
		},
		// 获取cookie
		getCookie: function(cname) {
			let ca = document.cookie.split("; ");
			console.log(ca)
			let _value = "";
			for(var i = 0; i < ca.length; i++) {
				let c = ca[i].split("=");					
				if(c.indexOf(cname) != -1) {
					_value = c[1];
				};
			};
			return _value;
		},
		// 清除cookie
		clearCookie: function() {
			this.setCookie("username", '', -1);
		},
		checkCookie: function() {
			let user = this.getCookie("username");
			if(user != "") {
				alert("welcome again" + user);
			} else {
				user = prompt("please enter your name:", "");
				if(user != "" && user != null) {
					this.setCookie("username", user, 365);
				}
			}
		}
	}
})