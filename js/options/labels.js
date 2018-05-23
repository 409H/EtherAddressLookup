window.addEventListener('load', () => {
    const labels = new Labels();

    labels.setupFormSubmitHandler();

    labels.updateLabelsList();
});