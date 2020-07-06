
validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
      email: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      surname: {
        type: DataTypes.STRING
      }
    }, {
        timestamps: false
    });
  
    return User;
  };