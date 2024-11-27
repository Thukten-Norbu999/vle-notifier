function getDaysLeft(date) {
    if(date === new Date()){
        return 0
    }
    else{
        let difference =  new Date(date).getTime() - new Date().getTime() ;
  
        const msInDay = 24 * 60 * 60 * 1000;
        const msInHour = 60 * 60 * 1000;
      
        const totalDays = difference / msInDay;
      
        // Extract full days and the remaining fractional part
        const fullDays = Math.floor(totalDays);
      
        return fullDays+1;
    }
   
  }

