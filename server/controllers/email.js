const sgMail = require('@sendgrid/mail');
require("dotenv").config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  sendEmail: (email, subject, text, res) => {
    try {
      sgMail
      .send({
        to: email,
        from: 'support@prim6llc.com',
        subject: subject,
        html: 
            '<p>Link: ' + text + '</p>'
      })
      .then(async () => {
      })
      .catch((err) => {
        console.error('error' + err);
      });
    } catch (error) {
        console.error('error' + error);
        return res.status(500).send({message: "Something went wrong"})
    }
  },

  supportEmail: (email, req, res) => {
    try {
      sgMail
      .send({
        to: email,
        from: 'support@prim6llc.com',
        subject: req.body.subject,
        html: 
            `Name: ${req.body.firstName} ${req.body.lastName}<br>
            Email: ${req.body.email}<br>
            Property Name: ${req.body.specificProp}<br>
            Description: ${req.body.description}`
      })
      .then(() => {
        console.error('msg sent');
      })
      .catch((err) => {
        console.error('error' + err);
      });
    } catch (error) {
        return res.status(500).send({message: "Something went wrong"})
    }
  },

  sharePropertyEmail: (req, res, property) => {
    try {
      sgMail
      .send({
        to: req.body.email,
        from: 'support@prim6llc.com',
        subject: 'Property Information',
        html: 
          '<p>Here are all the detials about property ' +'</p>' +
          '<p>' + 
            'Name: ' + property.name  +'<br>' +
            'Type: ' + property.propType + '<br>' +
            'Inital Size: ' + property.sizeByMonth.size[0] + '<br>' +
            'Address: ' + property.address + '<br>' +
            'City: ' + property.city + '<br>' +
            'State: ' + property.state + '<br>' +
            'Country: ' + property.country + 
          '</p>' +
          '<br>' +
          '<a href="https://www.prim6llc.com/">' +
          '<img src="http://prim6-frontend.s3-website-us-east-1.amazonaws.com/static/media/logo.496f2bc2.png" alt="Prim6llc" style="height:35px">'    
      })
      .then(async () => {
      })
      .catch((err) => {
        console.error('error' + err);
      });
    } catch (error) {
        return res.status(500).send({message: "Something went wrong"})
    }
  }
}

