// 1. Target your element in JavaScript. 
// Store refs to the form and all of its input to avoid re-querying each input

// 2. Capture the form submission event
$('#login-form').submit((event) => {
    //3. Prevent the default form submission from continuing. 
    //The default action submits form and triggers a form reload, refreshing the page. 
    event.preventDefault();
    if ($('#usernameInput').val().trim() || $('#passwordInput').val().trim()) {
      //textInput is not just spaces or empty when submitting. 
        
      //after hitting the submit button, hide the previous error
      $('#error').hide();
      $('#userLabel').removeClass('error');
      $('#passwordLabel').removeClass('error');
      $('#usernameInput').removeClass('inputClass');
      $('#passwordInput').removeClass('inputClass');
      // 4. Check if all inputs are correct (correct range, required, etc) 
      // If yes, allow the form to submit- allow default event
      try{
        helpers.validateString("Password", password, String.raw`^[A-Za-z0-9\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]{6,}$`, "Password: No spaces but can be any characters including special characters and should be atleast 6 characters long")
  
        if(!(new RegExp(String.raw`[A-Z]`)).test(password)){
          throw("Password: Needs to be atleast 1 uppercase letter ")
        }
        if(!(new RegExp(String.raw`[0-9]`)).test(password)){
          throw("Password: Needs to be atleast 1 digit ")
        }
        if(!(new RegExp(String.raw`[\+\*\?\^\$\\\.\[\]\{\}\(\)\|\/\<\>\-\&\%\_\!]`)).test(password)){
          throw("Password: Needs to be atleast 1 special character ")
        }
      }catch (e){
        // 5. If there's a bad input, the form should not be submitted then show an error message describing to the user how to correct it
        // prevent default event
        errorDOM(e)
      }
  
      //Add element <li>array<li> to the end inside UL.
      const li = `<li> ${$('#text_input').val()} </li>`;
      $('#list').append(li);
  
      //finally, clear the textbox of submission and put blinking cursor on textInbox for the next input
      $('#myForm').trigger('reset');
      $('#text_input').focus();
  
    } else {
      // 5. If there's a bad input, the form should not be submitted then show an error message describing to the user how to correct it
        // prevent default event
      errorDOM("Either the username or password is missing")
    }
  });
  
  let errorDOM = (errorMsg) =>{
    $('#error').show();
    $('#error').html(errorMsg);
    $('#formLabel').addClass('error');
    $('#text_input').addClass('inputClass');
    $('#text_input').focus();
    $('#text_input').value = '';
  }