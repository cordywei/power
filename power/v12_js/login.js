new Vue({
    el:"#login",
    data:{
        loginValidate: {
            id:"",
            password:"",
            verifyNum:""
        },
        ruleValidate: {
            id:[
                { required:true, message:"请输入您的账号", trigger: 'blur'},
                { required:true, message:"您的账号输入有误请重新输入", trigger: 'blur'}
            ],
            password:[
                { required:true, message:"请输入您的账号", trigger: 'blur'},
                { required:true, message:"您的密码输入有误请重新输入", trigger: 'blur'}
            ],
            verifyNum:[
                { required:true, message:"请输入您的账号", trigger: 'blur'},
                { required:true, message:"您的验证码输入有误请重新输入", trigger: 'blur'}
            ]
        }
    },
    methods:{
        /**
         *
         * 
         * 
         * 
         * 
         * 
         */
        canLogin(name){
            this.$refs[name].validate((valid) => {
                if(valid){
                    this.$Message.success('');
                }else{
                    this.$Message.error('');
                }
            })
        }
    }
})