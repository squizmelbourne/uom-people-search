var emailMaskList = [{ email: "g.davis@unimelb.edu.au", mask: "vc@unimelb.edu.au "},
                     { email: "jamesm1@unimelb.edu.au", mask: "dvc-research@unimelb.edu.au"  },
                     { email: "eale@unimelb.edu.au", mask: "chancellor@unimelb.edu.au" }
                    ];

var EmailMasks = function(email) {
    var processedEmail = email;
    for(var i=0;i<emailMaskList.length;i++){
        var maskList = emailMaskList[i];
        if(email == maskList.email){
          processedEmail = maskList.mask;
        }

    }
    return processedEmail;
}

module.exports = EmailMasks;
