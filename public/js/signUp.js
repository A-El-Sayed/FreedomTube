function checkIsProperString(str,strName){
    if(typeof str !== 'string' || str === null || str=== undefined){
        throw `${strName || 'provided variable'} should be string`;
    }
    if(str.trim().length == 0|| str.length == 0){
        throw `${strName || 'provided string'} cannot be empty or all spaces`
    }
}

function validateEmail(email){
    if (!email.match(String.raw`^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$`)){
        throw ('invalid email')
    }
}

//"Check a password between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter. underscore is allowed
function validatePassword(password){
    if(!String.raw`[A-Z]`.test(password)){
        throw("Needs to be atleast 1 uppercase letter ")
    }
    if(!String.raw`[a-z]`.test(password)){
        throw("Needs to be atleast 1 lowercase letter ")
    }
    if(!String.raw`[0-9]`.test(password)){
        throw("Needs to be atleast 1 digit ")
    }
   if(!password.match(String.raw`^[\w]{6,20}$`)){
    throw("Needs to be between 6 to 20 characters.")
   }
}

function checkIsLetterOrNum(str,strName){
    for (var i=0;i<str.length;i++) {
        var asc = str.charCodeAt(i);
        if (!(asc >= 65 && asc <= 90 || asc >= 97 && asc <= 122 || asc>=48 && asc<=57)) {
            throw `${strName || 'provided variable'} contains characters are not letters or number `;
        }
    }

}


// 1. Target your element in JavaScript. 
// Store refs to the form and all of its input to avoid re-querying each input
let myForm = document.getElementById('myForm');
let channelName = document.getElementById('channelName');
let emailAddress = document.getElementById('emailAddress');
let password = document.getElementById('password');
let errorDiv = document.getElementById('error');
let formLabel = document.getElementById('formLabel');

let resetText = (textInput, formLabel) =>{
    textInput.classList.remove('inputClass');
    errorDiv.hidden = true;
    formLabel.classList.remove('error');
}

let errorDOM = (errorMsg, textInput, formLabel) =>{
  
    //remove the input
    textInput.value = '';
    
    //Offer a suggested correction
    errorDiv.hidden = false;
    errorDiv.innerHTML = errorMsg;

    //highlight the inputs that need to be corrected
    formLabel.className = 'error';
    textInput.className = 'inputClass';

    //focus the user's cursor into a bad input
    textInput.focus();
    
}

if (myForm) { 

    // 2. Capture the form submission event
    myForm.addEventListener('submit', (event) => {
    
    //3. Prevent the default form submission from continuing. 
    //The default action submits form and triggers a form reload, refreshing the page. 
    event.preventDefault();

    try{

        //After hitting the submit button, hide the previous error
        textInput.classList.remove('inputClass');
        errorDiv.hidden = true;
        formLabel.classList.remove('error');

        

        const channelName = channelName.value;
        const emailAddress = emailAddress.value;
        const password = password.value;

        checkIsProperString(channelName, "channel name");
        checkIsLetterOrNum(channelName, "channel name");

        checkIsProperString(emailAddress, "email address");
        validateEmail(emailAddress);
        
        checkIsProperString(password, "channel name");
        validatePassword(password);

        
    }catch (e){
        errorDOM(e)
    }

    if (textInput.value.trim()) {
      //textInput is not just spaces or empty when submitting. 
      
      //after hitting the submit button, hide the previous error
      resetText()
      textInput.classList.remove('inputClass');
      errorDiv.hidden = true;
      formLabel.classList.remove('error');

      
      // 4. Check if all inputs are correct (correct range, required, etc) 
      // If yes, allow the form to submit- allow default event
      try{
        let resultString = textInput.value.trim()

        //regex (String.raw`^(\[( *-?\d+ *)(, *-?\d+ *)*\] *)(, *\[( *-?\d+ *)(, *-?\d+ *)*\] *)*,?$`)
        if(!resultString.match(String.raw`^(\[( *-?\d+ *)(, *-?\d+ *)*\] *)(, *\[( *-?\d+ *)(, *-?\d+ *)*\] *)*,?$`)){
          throw('Must be whole numbers and atleast one element in each array.');
        }

        for (const match of resultString.matchAll(String.raw`(-?\d+)`)){
          if(match[0].match(String.raw`-0+`)){
            throw("No negative 0");
          }
        }

        let arrayNumber = [];
        for (const match of resultString.matchAll(String.raw`(-?\d+)`)){
            arrayNumber.push( Number(match[0]));
        }
        arrayNumber.sort(function(a, b) {
          return a - b;
        });
        
        //Add element <li>array<li> to the end inside UL.
        let li = document.createElement('li');
        if(isGreen){
          li.className="is-green"
        }else{
          li.className="is-red"
        }
        isGreen = !isGreen
        li.innerHTML = `[${arrayNumber.toString()}]`;
        myUl.appendChild(li);

        //finally, clear the textbox of submission and put blinking cursor on textInbox for the next input
        myForm.reset();
        textInput.focus();
      }catch (e){
        // 5. If there's a bad input, the form should not be submitted then show an error message describing to the user how to correct it
        // prevent default event
        errorDOM(e)
      }
    } else {
      //textinput is empty when client hit the submit
      errorDOM('You must enter a value');

    }
  });
}
