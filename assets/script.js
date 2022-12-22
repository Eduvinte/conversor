
const apiUrl = "https://mindicador.cl/api/";
let clp = document.querySelector("#ipt-clp");
let selectDivisa = document.querySelector("#slt-moneda");
let resultadoConversion = document.querySelector("#resultado-conversion");
let resultadoValorDivisa = document.querySelector("#resultado-valor-divisa");
let resultadoNombreDivisa = document.querySelector("#resultado-nombre-divisa");
let btnBuscar = document.querySelector("#btn-buscar");
let btn = document.querySelector("#btn");
let grafico = "";
let valorDivisa = "";
let nombreDivisa = "";

const extraccionData = async (divisaX = "") => {
    try {
        const respuestaApi = await fetch(`${apiUrl}${divisaX}`);
        const data = await respuestaApi.json();
        return data;
    } catch (error) {
        alert(error.message);
    }
}

const excluir = ["autor", "version", "ivp", "ipc", "imacec", "tasa_desempleo", "tpm", "fecha", "dolar_intercambio"];

async function extraccionDataSelect() {
    try {
        const data = await extraccionData();
        const arrayData = Object.keys(data);
        const arrayFiltrado = arrayData.filter((item) => {
            return item === "dolar" || item === "euro";
        });
        let selector = document.getElementById("slt-moneda")
        for (let i = 0; i < arrayFiltrado.length; i++) {
            selector.options[i] = new Option(`${arrayFiltrado[i]}`)
        }
    } catch (error) {
        console.log(error);
    }
};

const conversion = async (inputClp, divisa) => {
    try {
        const data = await extraccionData();
        const arrayData = Object.entries(data);
        arrayData.filter((elemento) => {
            if (elemento[1].codigo === divisa) {
                valorDivisa = elemento[1].valor;
                nombreDivisa = elemento[1].nombre;
                return true;
            }
        });
        resultadoConversion.innerHTML = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(inputClp / valorDivisa);
        resultadoValorDivisa.innerHTML = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(valorDivisa);
        resultadoNombreDivisa.innerHTML = nombreDivisa;
        
    } catch (error) {
        console.log(error);
    }
};

const dataGrafico = async (divisa) => {
    const dataExtraida = await extraccionData(divisa);
    const arrayData = Object.entries(dataExtraida);
    const labels = arrayData[5][1].map((label) => label.fecha.split('T')[0]);
    const data = arrayData[5][1].map((label) => label.valor);
    nombreDivisa = arrayData[3][1];

    const datasets = [{
        label: nombreDivisa,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data
    }];
    return { labels, datasets }
}

const renderGrafica = async (divisa) => {
    const data = await dataGrafico(divisa);
    const config = {
        type: "line",
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    };
    const myChart = document.getElementById("myChart");
    grafico = new Chart(myChart, config);
}

window.onload = function () {    
    extraccionDataSelect();
}

btnBuscar.addEventListener('click', () => {
    if (grafico != "" && grafico != undefined) {
        grafico.destroy();
    }
    if (isNaN(clp.value) === false && Number(clp.value) !== 0 ) {
        document.getElementById("resultados").style.display = "block";
        conversion(clp.value, selectDivisa.value);
        renderGrafica(selectDivisa.value);
    }
    else {
        alert("Favor de ingresar Monto en CLP");
        document.querySelector("#ipt-clp").value= "";
        document.querySelector("#ipt-clp").focus();
    }
});