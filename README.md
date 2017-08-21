# Melbourne Cafes and restaurants, with seating capacity


## Launching

The site is launched by simply opening the index.html in your preferred web browser which will lead to the app. The Left side is for the filter box and the listview. The right is the map. Enter text into the textbox on the left to filter the markers on the map.

## Data Source

The data is provided by [Melbourne Data ](https://data.melbourne.vic.gov.au/Economy/Cafes-and-restaurants-with-seating-capacity/xt2y-tnn9). To fetch the data we use the following Ajax asynchronous request.

```
$.ajax({
    url: "https://data.melbourne.vic.gov.au/resource/erx6-js9z.json?census_year=2016&clue_small_area=Melbourne (CBD)",
    type: "GET",
    data: {
        "$limit": 200,
        "$$app_token": "iG0srAA3CLAwpIPFCL6qEKKs5"
    }
})
```

We use the endpoint with query parameters that set Census_year to 2016 and clue_small_area to Melbourne (CBD) which will show all businesses in the CBD while keeping out old and redundant records. The app_token provided is mine and the response returns a maximum of 200 results.

Caution: At the writing of this readme, the server had suddenly started to experience internal server errors. This is handled gracefully by the code(error popup) so simply refresh the page a couple of times and you should get a successful response.

## Data Binding

We use KnockoutJS to handle dynamic data binding between the listView in the index.html and the ViewModel object. This allows filtering of the businesses based on the filter text.
