const ResponseFunction = (object) =>{
    // token , username , reg , email , workid 
    const responseObject = {
        ...object.token && { token:object.token },
        ...object.username && { username:object.username },
        ...object.identity && { identity:object.identity },
        ...object.email && { email:object.email },
        ...object.error && { error:object.error },
        ...object.message && { message:object.message },
    }
    responseObject.status =`${object.error?404:200}`;
    return(responseObject);
}

module.exports = {ResponseFunction};