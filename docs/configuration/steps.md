# Steps Configuration

## Component Types
This config file is structured like the following listing:

```javascript
window.steps = [
    // array of objects where each object is a single step in the questionnaire
]
```

Basic structure of a step object:

```javascript
{
    title: 'title of the step',
    fields: [
        {
            label: 'label of input field',
            type: 'text', // see below for available types
            explanation: 'DM-16', // optional: this gets mapped to wizard.explanations.config.js
            isaMapping: {
                entity: 'investigation',
                attribute: 'title'
            }
        }
    ],
    hook: 'addStudy' // optional: add a hook function to be executed after this step 
}
```

## Field Types

The following types for a field are available:

 * text
 * textarea
 * date
 * people

----

Example for a step consisting of one text and one textarea input field, both mapped to native ISA attributes:

```javascript
{
    title: 'Please provide title and description of your plant phenotyping project',
    fields: [
        {
            label: 'Project title',
            type: 'text',
            explanation: 'DM-16',
            isaMapping: {
                entity: 'investigation',
                attribute: 'title'
            }
        },
        {
            label: 'Project description',
            type: 'textarea',
            explanation: 'DM-17',
            isaMapping: {
                entity: 'investigation',
                attribute: 'description'
            }
        }
    ]
}
```

Example for a <b>field</b> that gets mapped to an ISA comment:

```javascript
fields: [
    {
        label: 'Contact address',
        type: 'text',
        explanation: 'DM-16',
        isaMapping: {
            entity: 'study',
            attribute: 'comments',
            commentName: 'Study Contact Institution'
        }
    }
]
```

## Hooks
!!! note

    When a Study is defined via 'prefill' then it will be also automatically added to the Investigation. The 'addStudy' hook is then only needed when you want to add an additional/second Study.
    

Available hook functions:
 * addStudy => creates a study <b>add the end</b> of a step
 * addProtocol => creates a protocol <b>add the end</b> of a step

---

Example of addStudy hook:
```javascript
{
    title: 'A step after which a study is created',
    fields: [],
    hook: 'addStudy' 
}
```

Example of addStudy hook:
```javascript
{
    title: 'A step after which a study is created',
    fields: [],
    hook: 'addProtocol',
    hookParameters: {
        protocolName: 'Growth',
        protocolVersion: 'MIAPPE v1.1',
        protocolDescription: 'How the plants were grown up.',
        protocolParameters: ['Light intensity', 'Air temperature']
    }
}
```