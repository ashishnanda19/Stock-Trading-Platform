class ApiError extends Error{
    constructor(
        statuscode,
        message="Something went Wrong",
        errors=[],
        stack=""
    ){
        super(message)
        this.statuscode=statuscode
        this.data=null///why??(jo error ke sath bhejna hota hai[error kka detail])
        this.message=message
        this.success=false;
        this.errors=errors
        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export default ApiError