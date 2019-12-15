function splitList() {
    let addHere = document.getElementById("add-here");
    let transactionType = document.getElementById("type").value;
    if (transactionType === "debit") {
        if (!document.getElementById('split')) {    
            let array = ["Don't Split", "Split"]
            let splitOption = document.createElement("select");
            splitOption.id = "split";
            splitOption.name = "split";
            splitOption.class = "form-control";
            addHere.appendChild(splitOption);

            for (let i = 0; i < array.length; i++) {
                let option = document.createElement("option");
                option.value = array[i];
                option.text = array[i];
                splitOption.appendChild(option);
            }
        }
        else
            $("#split").show();
        if (!document.getElementById('addButton') && !document.getElementById('input')) {   
            let getNumber = document.createElement("input");
            getNumber.type = "number";
            getNumber.id = "input";
            getNumber.name = "input";
            getNumber.class = "form-control";
            addHere.appendChild(getNumber);
            let addButton = document.createElement('a');
            addButton.innerHTML = "Add";
            addButton.href = "#";
            addButton.id = "addButton";
            addButton.name = "addButton";
            addButton.type = "button";
            addButton.class = "btn btn-default ml-4";
            addHere.appendChild(addButton);
            let addButtonClick = document.getElementById("addButton")
            addButtonClick.addEventListener("click", function() {
                let noOfPeople = document.getElementById('input');
                let number = noOfPeople.value;
                let container = document.getElementById('container');
                while (container.hasChildNodes()) {
                    container.removeChild(container.lastChild);
                }
                for (let i = 0; i < number; i++){
                    container.appendChild(document.createTextNode(`Person ${i+1}`));
                    var input = document.createElement("input");
                    input.id = "person";
                    input.type = "email";
                    input.name = "person" + i;
                    input.class = "form-control";
                    container.appendChild(input);
                    container.appendChild(document.createElement("br"));
                    $("#input").val(0);
                }
            });
            $("#input").hide();
            $("#addButton").hide();
        }
        else {
            $("#input").hide();
            $("#addButton").hide();
        }
        let selectedOption = document.getElementById('split');
        selectedOption.addEventListener('change', function() {
            if (this.value === "Split") {
                $("#input").val(0);
                $("#input").show();
                $("#addButton").show();
            }
            if (this.value === "Don't Split") {
                $("#input").val(0);
                $("#input").hide();
                $("#addButton").hide();
                while (container.hasChildNodes()) {
                    container.removeChild(container.lastChild);
                }
            }
          }, false);
    }
    if(transactionType === "credit") {
        $("#split").hide();
        $("#split").val("Don't Split");
        $("#input").val(0);
        $("#input").hide();
        $("#addButton").hide();
        while (container.hasChildNodes()) {
            container.removeChild(container.lastChild);
        }
    }
}

module.exports = {
    splitList
}