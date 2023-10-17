import {users as User, booths as Booth, sessions as Session} from "@prisma/client";
import hidash from "../utils/hidash";
import {int} from "aws-sdk/clients/datapipeline";

function footer() {
    return `<div style="clear: both; margin-top: 10px; text-align: center; width: 100%; margin-bottom: 10px;">
                <table role="presentation" border="0" cellpadding="20" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                  <tbody><tr>
                    <td style="background:black;font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                      <b><p style="color: #999999; font-size: 12px; text-align: center; word-break: break-all;">CONTACT US:</p></b>
                      <p style="color: #999999; font-size: 12px; text-align: center; word-break: break-all;">Cohive 101 - 9th floor, Jl. DR. Ide Anak Agung Gde Agung No. 1, Kawasan Mega Kuningan . Jakarta - 12950</p>
                      <p style="color: #999999; font-size: 12px; text-align: center; word-break: break-all; line-height:0px">WhatsApp: 081282846468</p>
                      <br>
                      <p style="color: #999999; font-size: 10px; text-align: center; word-break: break-all;">Copyright &#169; 2023 Indonesia 4.0 Conference & Expo - Naganaya Indonesia Event</p>
                    </td>
                  </tr>
       
                </tbody></table>
              </div>`
}


function accountVerificationUser(user: User) {

    // return{
    //     subject: `JAKENT Account Verification for ${user.email}`,
    //     body:`
    // 	Hello ${user.full_name},
    // 	<br><br>
    // 	Thank you for registering to JAKENT 2022!
    // 	<br><br>
    // 	To finish setting up your account, we just need to make sure this email address is yours.
    // 	<br>
    // 	Please click the link below to verify your email address.
    // 	<br>
    // 	<p><a href=${process.env.SELF_URL}/v1/user/activate/${user.activation_token}>Click here to verify your email</a></p>
    // 	<br>
    // 	This verification link is valid for ${process.env.ACTIVATION_TOKEN_DURATION} hours.
    // 	<br><br>
    // 	If you didn't create this account, you can safely ignore this email. Someone else might have typed your email address by mistake.
    // 	<br><br><br>
    // 	Thanks,<br>
    // 	Organizing Committee<br>
    // 	JAKENT 2022
    // 	`,
    // }
}


function requestOTP(user: User) {

    return {
        subject: `Request OTP`,
        body: `
		Hello ${user.name},
		<br><br>

		Here is your OTP: <b>${user.otp}</b>. 

		<br><br><br>
		Regards,
		<br>
		Website Administrator
		<br>
		intellivent-registration
		`,
    }
}

function passwordReset(user: User, token: string) {

    return {
        subject: `Request to reset password`,
        body: `
		Hello ${user.name},
		<br><br>

		We received a request to reset your password. Here is the token required to reset your password: <b>${token}</b>. 
		The token is only valid for ${process.env.RESET_PASSWORD_TOKEN_DURATION} hour.
		
		<br><br>
		You can go to this page https://intellivent-registration-user.komunestudio.com/reset-password?email=${user.email}&token=${token} to reset your password.

		<br><br><br>
		Regards,
		<br>
		Website Administrator
		<br>
		intellivent-registration
		`,
    }
}

function userRegistration(user: User) {

    return {
        subject: `User Registration`,
        body: `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
        <tbody><tr>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          <td  style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
            <div style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <table role="presentation" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
  
                <!-- START MAIN CONTENT AREA -->
                <tbody><tr>
                  <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tbody><tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                          <center><h2 style="color:#34dbbf">Hi ${user.name} !</h2>
                              <span style="color:#999999"></span>
                              <p>Welcome to Indonesia 4.0. This is your QR code</p>
                              <img src="${user.qr_url}"></img>
                              <p> Your registration code is ${user.uuid}. Please prepare this QR when entering our venue.</p>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 30%;" width="100%">
                            <tbody>
                              <tr>
                                <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>                          
                          
                      </center> 
                        </td>
                      </tr>
                    </tbody></table>
                  </td>
                </tr>
  
              <!-- END MAIN CONTENT AREA -->
              </tbody></table>
              <!-- END CENTERED WHITE CONTAINER -->
  
              ${footer()}
  
            </div>
          </td>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
      </tbody></table>  
        `
    }
}

function sessionUserFormRegistration(user_name:string, session: Session) {

    return {
        subject: `Coaching Clinic Registration`,
        body: `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
        <tbody><tr>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          <td  style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
            <div style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <table role="presentation" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
  
                <!-- START MAIN CONTENT AREA -->
                <tbody><tr>
                  <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tbody><tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                          <center><h2 style="color:#34dbbf">Hi ${user_name} !</h2>
                              <span style="color:#999999"></span>
                              <p> Thank you for registering for our coaching clinic program. We will review the problems you are facing and contact you promptly if you are selected to consult with our experts.</p>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 30%;" width="100%">
                            <tbody>
                              <tr>
                                <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>                          
                          
                      </center> 
                        </td>
                      </tr>
                    </tbody></table>
                  </td>
                </tr>
  
              <!-- END MAIN CONTENT AREA -->
              </tbody></table>
              <!-- END CENTERED WHITE CONTAINER -->
  
              ${footer()}
  
            </div>
          </td>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
      </tbody></table>  
        `
    }
}
function sessionRegistration(user: User, session: Session) {

    return {
        subject: `Coaching Clinic Registration`,
        body: `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
        <tbody><tr>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          <td  style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
            <div style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
  
              <!-- START CENTERED WHITE CONTAINER -->
              <table role="presentation" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">
  
                <!-- START MAIN CONTENT AREA -->
                <tbody><tr>
                  <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tbody><tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                          <center><h2 style="color:#34dbbf">Hi ${user.name} !</h2>
                              <span style="color:#999999"></span>
                              <p> Thank you for registering for our coaching clinic program. We will review the problems you are facing and contact you promptly if you are selected to consult with our experts.</p>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 30%;" width="100%">
                            <tbody>
                              <tr>
                                <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>                          
                          
                      </center> 
                        </td>
                      </tr>
                    </tbody></table>
                  </td>
                </tr>
  
              <!-- END MAIN CONTENT AREA -->
              </tbody></table>
              <!-- END CENTERED WHITE CONTAINER -->
  
              ${footer()}
  
            </div>
          </td>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
      </tbody></table>  
        `
    }
}


function boothRegistration(booth: Booth) {

    return {
        subject: `Booth Registration`,
        body: `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
        <tbody><tr>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
          <td  style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
            <div style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">

              <!-- START CENTERED WHITE CONTAINER -->
              <table role="presentation" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">

                <!-- START MAIN CONTENT AREA -->
                <tbody><tr>
                  <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                      <tbody><tr>
                        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                          <center><h2 style="color:#34dbbf">Hi ${booth.name} !</h2>
                              <span style="color:#999999"></span>
                              <p>Welcome to Indonesia 4.0. This is your QR code</p>
                              <img src="${booth.qr_url}"></img>
                              <p> Your registration code is ${booth.uuid}. Please prepare this QR when entering our venue.</p>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 30%;" width="100%">
                            <tbody>
                              <tr>
                                <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                  <table border="0" cellpadding="0" cellspacing="0">
                                    <tbody>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>                          
                          
                      </center> 
                        </td>
                      </tr>
                    </tbody></table>
                  </td>
                </tr>
  
              <!-- END MAIN CONTENT AREA -->
              </tbody></table>
              <!-- END CENTERED WHITE CONTAINER -->
  
              ${footer()}
  
            </div>
          </td>
          <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        </tr>
      </tbody></table> 
        `
    }
}

function h1_reminder(user: User) {

  return {
      subject: `Indonesia 4.0 | Be Ready`,
      body: `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
      <tbody><tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        <td  style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
          <div style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">

            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">

              <!-- START MAIN CONTENT AREA -->
              <tbody><tr>
                <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tbody><tr>
                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                        <center><h2 style="color:#34dbbf">Hi ${user.name} !</h2>
                            <span style="color:#999999"></span>
                            <p> Be ready! Tomorrow is the day of the Indonesia 4.0 Conference & Expo 2023.</p>
                            <img src="${user.qr_url}"></img>
                            <p> Your registration code is ${user.uuid}. Prepare your barcode to enter the venue. See you!</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 30%;" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                <table border="0" cellpadding="0" cellspacing="0">
                                  <tbody>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>                          
                        
                    </center> 
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </tbody></table>
            <!-- END CENTERED WHITE CONTAINER -->

            ${footer()}

          </div>
        </td>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
      </tr>
    </tbody></table>  
      `
  }
}


export default {
    accountVerificationUser,
    passwordReset,
    userRegistration,
    boothRegistration,
    requestOTP,
    sessionRegistration,
    sessionUserFormRegistration,
    h1_reminder

}
