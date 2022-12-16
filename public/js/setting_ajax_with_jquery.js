changeProfileLink= $('.changeProfile')
profile_form= $('#profile-form-area')

changeProfileLink.on('click', function (event){
    event.preventDefault();
    changeProfileLink.toggleClass("toggle");
    var addForm = changeProfileLink.hasClass("toggle")

    if(addForm){
        profile_form.append('<label for="pictureUploader"> Picture:  </label>')
        profile_form.append('<input type="file" name="profilePicture" id="pictureUploader">')
    }else{
        profile_form.empty()
    }
})
