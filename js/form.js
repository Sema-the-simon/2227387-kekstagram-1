import {isEscapeKey, getParamsForEffect} from './utils.js';

//form
const uploadForm = document.querySelector('.img-upload__form');
//upload file
const inputFile = uploadForm.querySelector('#upload-file');

//pictur redactor
const editPictureForm = uploadForm.querySelector('.img-upload__overlay');
//buttons
const closeButton = editPictureForm.querySelector('#upload-cancel');
const smallerScaleButton = editPictureForm.querySelector('.scale__control--smaller');
const biggerScaleButton = editPictureForm.querySelector('.scale__control--bigger');
const effectsButtons = editPictureForm.querySelectorAll('.effects__radio');
//slider
const sliderField = editPictureForm.querySelector('.img-upload__effect-level');
const sliderElement = sliderField.querySelector('.effect-level__slider');
const sliderValue = sliderField.querySelector('.effect-level__value');

//fields
const scaleInput = editPictureForm.querySelector('.scale__control--value');
const imgPreview = editPictureForm.querySelector('.img-upload__preview');
const description = uploadForm.querySelector('.text__description');

let  effect, pristine;

function onPopupEscKeydown(evt){
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    closePictureRedactor();
  }
}

function onPopupEscKeydownPrevent(evt){
  if (isEscapeKey(evt)) {
    evt.stopPropagation();
  }
}

function onFormSubmit(evt){
  evt.preventDefault();
  pristine.validate();
}

function onSmallerButtonClick(){
  const value = parseInt(scaleInput.value, 10) - 25;
  if (value < 25) {
    scaleInput.value = '25%';
    imgPreview.style.transform = 'scale(0.25)';
  } else {
    scaleInput.value = `${value}%`;
    imgPreview.style.transform = `scale(${value/100})`;
  }
}

function onBiggerButtonClick(){
  const value = parseInt(scaleInput.value, 10) + 25;
  if (value > 100) {
    scaleInput.value = '100%';
    imgPreview.style.transform = 'scale(1)';
  } else {
    scaleInput.value = `${value}%`;
    imgPreview.style.transform = `scale(${value/100})`;
  }
}

function onEffectChange(evt){
  imgPreview.classList.remove(`effects__preview--${effect}`);
  effect = evt.target.value;
  imgPreview.classList.add(`effects__preview--${effect}`);
  if (effect !== 'none') {
    sliderField.classList.remove('hidden');
    changeSliderOptions();
  } else {
    sliderField.classList.add('hidden');
    imgPreview.style.filter = '';
  }

}

function addListeners(){
  //добавим обработчики закрытия загружаемого изображения
  //при клике на кнопку
  closeButton.addEventListener('click', closePictureRedactor, {once: true});
  //при нажатии Esc
  document.addEventListener( 'keydown', onPopupEscKeydown);

  //предотвращение закрытия если в фокусе поле для набора комментария
  description.addEventListener( 'keydown', onPopupEscKeydownPrevent);

  //обработчики редактора изображения
  smallerScaleButton.addEventListener('click', onSmallerButtonClick);
  biggerScaleButton.addEventListener('click', onBiggerButtonClick);
  for (const effectButton of effectsButtons){
    effectButton.addEventListener('change', onEffectChange);
  }

  //обработчик отправки формы
  uploadForm.addEventListener('submit', onFormSubmit);
}

function removeListeners(){
  document.removeEventListener( 'keydown', onPopupEscKeydown);

  description.removeEventListener( 'keydown', onPopupEscKeydownPrevent);

  smallerScaleButton.removeEventListener('click', onSmallerButtonClick);
  biggerScaleButton.removeEventListener('click', onBiggerButtonClick);

  uploadForm.removeEventListener('submit', onFormSubmit);


}


function openPictureRedactor(){
  editPictureForm.classList.remove('hidden');
  document.body.classList.add('modal-open');

  //default values
  scaleInput.value = '100%';
  imgPreview.style.transform = 'scale(1)';
  effect = 'none';
  sliderField.classList.add('hidden');

  //add slider
  createNoUiSlider();
  //add validator
  createPristineValidator();

  //add all listeners
  addListeners();
}

function closePictureRedactor(){
  inputFile.value = '';
  uploadForm.querySelector('.scale__control--value').value = '100%';
  uploadForm.querySelector('.effect-level__value').value = 'none';
  uploadForm.querySelector('.text__hashtags').value = '';
  description.value = '';

  removeListeners();

  editPictureForm.classList.add('hidden');
  document.body.classList.remove('modal-open');

}

//slider

function createNoUiSlider(){
  noUiSlider.create(sliderElement, {
    range: {
      min: 0,
      max: 1,
    },
    start: 1,
    step: 0.1,
    connect: 'lower',
    format: {
      to: function (value) {
        return value.toFixed(1);
      },
      from: function (value) {
        return parseFloat(value);
      },
    },
  });

  sliderElement.noUiSlider.on('update', () => {
    const value =  sliderElement.noUiSlider.get();
    sliderValue.value = value;

    const [, , , filterFuncName, sym] = getParamsForEffect(effect);
    imgPreview.style.filter = `${filterFuncName}(${value + sym})`;

  });
}

function changeSliderOptions(){
  const [min, max, step, filterFuncName, sym] = getParamsForEffect(effect);

  sliderElement.noUiSlider.updateOptions({
    range: {
      min: min,
      max: max
    },
    start: max,
    step: step
  });

  imgPreview.style.filter = `${filterFuncName}(${max + sym})`;
}

//valifation

function isValidHashtag(tag){
  const reg = /^#[A-Za-zА-Яа-яЁё0-9]{1,19}/;
  return reg.test(tag);
}

function validateHashtags(value){
  if(value === '') {return true;}

  const hashtagsArray = value.split(' ').map((newValue) => newValue.toLowerCase());
  if ((hashtagsArray.length > 5) || (!hashtagsArray.every(isValidHashtag))) {return false;}
  const uniqueArray = Array.from(new Set(hashtagsArray));
  return uniqueArray.length === hashtagsArray.length;
}

function createPristineValidator() {
  pristine = new Pristine(uploadForm, {
    classTo: 'img-upload__field-wrapper',
    errorTextParent: 'img-upload__field-wrapper',
    errorTextTag: 'span',
    errorTextClass: 'form__error'
  }, false);

  pristine.addValidator(
    uploadForm.querySelector('.text__hashtags'),
    validateHashtags,
    'хэштеги должны быть уникальны, Хэштегов должно быть не больше 5, Хэштеги могут сордержать только буквы и цифры'
  );
}

//global func
function loadForm(){
  inputFile.addEventListener('change', openPictureRedactor);
}

loadForm();
