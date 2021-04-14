'use strict';

// eslint-disable-next-line no-unused-vars
function myFunction() {
  var x = document.getElementById('myLinks');
  if (x.style.display === 'block') {
    x.style.display = 'none';
  } else {
    x.style.display = 'block';
  }
}


$('.updateBtn').on('click',()=>{
  $('.updateForm').toggle();
})
