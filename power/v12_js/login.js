new Vue({
    el:"#login",
    data:{
        loginValidate: {
            id:"",
            password:"",
            verifyNum:"",
            remember:""
        },
        ruleValidate: {
            id:[
                { required:true, message:"请输入您的账号", trigger: 'blur'},
                { type:'number', min:13, max:13, required:true, message:"您的账号输入有误请重新输入", trigger: 'blur'}
            ],
            password:[
                { required:true, message:"请输入您的密码", trigger: 'blur'},
                { type:'string', min:6, max:6,required:true, message:"您的密码输入有误请重新输入", trigger: 'blur'}
            ],
            verifyNum:[
                { required:true, message:"请输入您的验证码", trigger: 'blur'},
                { type:'number', min:4, max:4, required:true, message:"您的验证码输入有误请重新输入", trigger: 'blur'}
            ]
        },
        verifyImg:"../v12_images/footer_logo.png"
    },
    methods:{
        /**
         * @param name 表单名称
         * 
         */
        canLogin(name){
            this.$refs[name].validate((valid) => {
                if(valid){
                    
                }else{
                    
                }
            })
        }
    }
})