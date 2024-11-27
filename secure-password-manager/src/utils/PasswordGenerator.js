function generatePassword(options) {
    const { length, uppercase, lowercase, numbers, symbols } = options;
  
    const upperCaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let characterPool = '';
    if (uppercase) characterPool += upperCaseChars;
    if (lowercase) characterPool += lowerCaseChars;
    if (numbers) characterPool += numberChars;
    if (symbols) characterPool += symbolChars;
  
    if (characterPool === '') {
      alert('Please select at least one character type');
      return '';
    }
  
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomChar = characterPool.charAt(Math.floor(Math.random() * characterPool.length));
      password += randomChar;
    }
  
    return password;
  }
  
  export default generatePassword;
  