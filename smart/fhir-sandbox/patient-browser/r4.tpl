

{
    server: {
        type: 'R4',
        url: 'http://$HOST:$R4_PORT/hapi-fhir-jpaserver/fhir',
        tags: [],
    },
    patientsPerPage: 25,
    timeout: 20000,
    renderSelectedOnly: false,
    fhirViewer: {
        enabled: true,
        url: '$HOST:$FHIR_VIEWER_PORT/index.html',
        param: 'url',
    },
    outputMode: 'id-list',
    submitStrategy: 'manual',
}
