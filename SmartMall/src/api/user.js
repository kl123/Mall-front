import request from '@/utils/request.js'

export function Login(username,password) {
    return request.post('/login', 
      {
        username:username,
        password:password
      }
    
    )
}
// data：username  password
