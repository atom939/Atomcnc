
    'use strict';


    document.addEventListener('visibilitychange', function logData() {
        if (document.visibilityState === 'hidden') {
            let userData =
                window.navigator.userAgent
                + window.navigator.languages.join('');
            let formData = new FormData();
            formData.append('host', window.location.hostname);
            formData.append('path', window.location.pathname);
            formData.append('user_data', userData);
            formData.append('duration', (window.performance.now() / 1000).toString());
            navigator.sendBeacon('https://www.thuijzer.nl/simple_stats/', formData);
        }
    });