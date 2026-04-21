"use client"
import { useFormik } from 'formik';
import { CSSProperties, useState } from 'react';
import '@/app/globals.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';
import * as crypto from 'crypto';



// If implementing the signup feature, use the code from this page and /app/api/drawing/auth/register/route.ts



const Home = () => {

  const [signup, setSignup] = useState(false);

  const buttonStyling: CSSProperties = {
    float: 'left',
    color: 'black',
    textAlign: 'center',
    padding: '10px',
    textDecoration: 'none',
    fontSize: '15px',
    lineHeight: '25px',
    borderRadius: '4px',
    border: 'solid black',
    fontWeight: 'bold',
    marginTop: '3px',
    margin: '0px',
    fontFamily: "Arial",
    alignItems: 'center',
    display: 'inline-flex',
    backgroundColor: '#e8e1da'
  };

  const imageOverlayStyling: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1, // Ensure the overlay is below the form
  }


  const formStyling: CSSProperties = {
    position: 'relative',
    zIndex: 2, // Ensure the form is on top
    marginTop: '30px'
  }

  const checkboxStyling: CSSProperties = {
    position: 'relative',
    marginRight: '0px',
    zIndex: 2, // Ensure it is on top
    width: '240px',
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e1da',
    lineHeight: '25px',
    borderRadius: '4px',
    border: 'solid black',
    fontWeight: 'bold',
    fontSize: '15px',
    float: 'right'
  }

  const imageStyling: CSSProperties = {
    objectFit: 'cover'
  }

  const setAuth = (token: string) => {
    setCookie('authToken', token, { maxAge: 60 * 60 * 2 }); // Cookie lasts for 2 hours (MATCH BACKEND)
  }

  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      username : '',
      password: '',
    },

    onSubmit: async (values) => {
      const encrypted = encrypt(values.password);

      process.env.USERNAME =  values.username;
      process.env.PASSWORD = encrypted;

      if(signup === true) {
        console.log(JSON.stringify({...values, encrypted}));

        try {
          const response = await fetch('/api/drawing/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({...values, encrypted}),
          });

          formik.resetForm();
        
          if(response.ok) {
            alert(`User created successfully!`);
          } else {
            alert(`Failed to create user. Please try again, but use a different username.`);
          }

          setSignup(false); // Reset signup state after submission
        } catch (error) {
          alert(`Signup Error: ${error}`);
        }
      }

      else {
        console.log(JSON.stringify({...values, encrypted}));

        try {
          const response = await fetch('/api/drawing/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({...values, encrypted}),
          });
  
          formik.resetForm();

          if(response.ok) {
            response.json().then(x => {
              setAuth(x.token); //set env token for auth
  
              // Route to the page you were logging in from
              router.push('/drawing');
            })
          } else {
            alert(`Failed to find a user with those credentials. Please try again.`);
          }
        } catch (error) {
          alert(`Login Error: ${error}`);
        }
      }
    },
  });

  const encrypt = (password : string) => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }


  const boxStyling: CSSProperties = {
    padding: '8px',
    borderRadius: '4px',
    border: 'solid black',
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '10px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
  };

  const labelStyling: CSSProperties = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: 'white',
  };

  return (
    <div id='app-body-main'>
      <div className="header" style={{height: "73px"}}>
        <a href="/" className="logo">
          <img
            id="logo-img-wide"
            src="/mapstructor_logo.png"
          />
        </a>

        <div id="header_text" className="headerText">
          <span id="headerTextSuffix" style={{fontSize: "24.3px"}}>| Login - Drawing Dev</span>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>

        <Image 
          src="/castello_newest.jpg" 
          alt="Background"
          fill 
          style={imageStyling}
        />
        <div style={imageOverlayStyling}></div> 
        <div style={formStyling}>
          <form onSubmit={formik.handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '30px' }}>          
            <div style={{ marginBottom: '15px', color: '#333' }}>
                <label htmlFor="username" style={labelStyling}>Username:</label>
                <input type="text" id="username" name="username" onChange={formik.handleChange} value={formik.values.username} style={boxStyling} />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="password" style={labelStyling}>Password:</label>
                <input type="password" id="password" name="password" onChange={formik.handleChange} value={formik.values.password} style={boxStyling} />
            </div>
            <div style={{display: 'inline-block', width: '400px'}}>
              <div style={checkboxStyling}>Check to Register Account &nbsp;
                  <input
                    type="checkbox"
                    checked={signup}
                    onChange={(e) => setSignup(e.target.checked)}
                  />
              </div>
              <button style={buttonStyling}
                type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;