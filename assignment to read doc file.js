const url =
  "https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub";

var setOptions = {
  method: "GET",
};
fetch(url, setOptions)
  .then((response) => {
    if (response.ok) {
      var reader = response.body.getReader();
      var decoder = new TextDecoder();
      reader.read().then(function (result) {
        var data = {};
        data = decoder.decode(result.value, {
          stream: !result.done,
        });
        // Parse the HTML string
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "text/html");

        // Get the table
        const table = doc.querySelector("table");

        // Extract table data
        const dataCells = [];
        table.querySelectorAll("tr").forEach((row, index) => {
          const cells = Array.from(
            row.querySelectorAll(index === 0 ? "th" : "td")
          );
          dataCells.push(cells.map((cell) => cell.textContent));
        });

          // Convert and filter only numeric values for 1st elements (index 0)
                const firstElements = dataCells
                    .map(subArray => Number(subArray[2]))
                    .filter(value => !isNaN(value));
                const maxFirstElement = Math.max(...firstElements);


                // Convert and filter only numeric values for 3rd elements (index 2)
                const thirdElements = dataCells
                    .map(subArray => Number(subArray[0]))
                    .filter(value => !isNaN(value));
                const maxThirdElement = Math.max(...thirdElements);
        console.log({maxFirstElement})
console.log({maxThirdElement})
        // Transform array to the desired nested object format
        let transformedData = transformDataToAxis(dataCells);
        // console.log(transformedData)
        // transformedData = transformedData.shift()

        // Convert sets to arrays (for JSON-compatibility, if needed)
        for (const key in transformedData) {
          for (const subKey in transformedData[key]) {
            transformedData[key][subKey] = Array.from(
              transformedData[key][subKey]
            );
          }
        }
// console.log({transformedData})
        //output in console
        for (let i  = 0; i< maxFirstElement; i++) {
          let row = "";
          for (let j = 0 ;j < maxThirdElement; j++) {
            if(transformedData[i][j]){
              row = row + transformedData[i][j][0];
            } else {
              row = row + "no";
            }
          }
          // console.log(row);
        }
      });
    } else {
      console.log("Response wast not ok");
    }
  })
  .catch((error) => {
    console.log("There is an error " + error.message);
  });

function transformDataToAxis(dataCells) {
  return dataCells.reduce((acc, [xCord, second, yCord]) => {
    // Initialize the yCord element group if it doesn't exist
    if (!acc[yCord]) {
      acc[yCord] = {};
    }
    // Initialize the xCord element group within the yCord element group if it doesn't exist
    if (!acc[yCord][xCord]) {
      acc[yCord][xCord] = new Set();
    }
    // Add the second element to the Set to ensure unique values
    acc[yCord][xCord].add(second);

    return acc;
  }, {});
}
