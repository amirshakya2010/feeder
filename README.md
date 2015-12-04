# Rss feed reader
## Install
 - bower install feeder
 - OR Download directly

## Usage
  ## Config api url
  ```
   .config([
    'feederApiConfigProvider',
    function(feederApiConfigProvider) {
        feederApiConfigProvider.setUrl('/api/feeds');
    }])
  ```
  ## Used as directive
  ```
  '<feed url = "https://myresearchesblog.wordpress.com/feed" feed-template-url = "path/to/template.html" no-result-text="Message for no result"></feed>'
  ```
  
