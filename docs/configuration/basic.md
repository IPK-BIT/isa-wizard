# Basic Configuration

## Configuring the export options

### ISA JSON Export

### ARC Export

### Gitlab Export

#### Connecting an instance

### :material-flask-outline: ISA Tab Export 

## Prefilling of ISA entities during wizard initialization

`config.prefill` is an array of objects. Each object consists of the keys `isaMapping` and `values`

Example to prefill the initially empty ISA object with a person under investigation level:

```javascript
window.config = {
    prefill: [
        {
            type: 'person',
            isaMapping: {
                entity: 'investigation'
            },
            values: {
                lastName : 'Max',
                firstName : 'Mustermann',
                midInitials : '',
                email : 'mustermann@ipk-gatersleben.de',
                phone : '1234',
                fax : '7890',
                address : 'Corrensstraße 3, 06646 Seeland',
                affiliation : 'IPK Gatersleben'
            }
        }
    ]
}    
```

Example to prefill a comment in the ISA object under investigation (alternatively study/assay) level:

```javascript
window.config = {
    prefill: [
        {
            type: 'comment',
            isaMapping: {
                entity: 'investigation',
                attribute: 'comments'
            },
            values: {
                name: 'Study Country',
                value: 'Germany'
            }
        }
    ]
} 
```

Example to prefill any ISA attribute, here the 'Study Description' in the ISA object under study (alternatively investigation/assay) level:

```javascript
window.config = {
    prefill: [
        {
            type: 'value',
            isaMapping: {
                entity: 'study',
                attribute: 'description',
                studyIndex: 0
            },
            value: 'Prefilled study description ...'
        }
    ]
}
```
