import jwt from 'jsonwebtoken';

 export const authorization = async (req, res, next) => {
  try {
    const isAdminRoute = req.originalUrl.startsWith('/admin');
    const cookieName = isAdminRoute ? 'adminJwtToken' : 'jwtToken'

    //sets cookie based on who logs in admin/user
    const cookie = req.cookies?.[cookieName];
    const authHeader = req.headers?.authorization;
    // access token is taken from either the cookies or  authorization header
    const accessToken = cookie || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if(!accessToken){
      return res.status(404).json({success: false, message: 'Unauthorized. No token found'});
    }

    // verifying access token
    const jwtUser = jwt.verify(accessToken, process.env.JWT_SECRET);

    if(!jwtUser || !jwtUser.id){
      return res.status(401).json({success: false, message: 'Unauthorized: Invalid token payload'})
    }

    

    req.user = {id: jwtUser.id}
   
    next();
    
  } catch (error) {
    console.error(error);
    if(error.name === 'JsonWebTokenError'){
      return res.status(401).json({success: false, message: 'Unauthorized: Invalid token'});
    }
    if(error.name === 'TokenExpiredError'){
      return res.status(401).json({success: false, message: 'Unauthorized: Token has expired'});
    }
    return res.status(500).json({success: false, message: 'Internal Server Error during authentication'});


  }
}


