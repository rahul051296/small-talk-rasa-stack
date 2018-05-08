# Smalltalk for Rasa Stack

Smalltalk for Rasa Stack has casual conversation data which can be used with Rasa Core and Rasa NLU as an add on to an existing training data.
# Prerequisites

- rasa_core (0.9.0a3)
- rasa_nlu (0.12.3)
- spacy (2.0.11) 

# Installation

### Build the NLU Model and Dialog Model:

``` 
python rasa_nlu_model.py
python rasa_dialogue_model.py
 ```

# Usages

### **Run the Bot in CMD:**

```
python bot.py
```

### **Run the Bot as web server:**

```
python server.py
```
 
**Server Status**

```
http://localhost:8081/api/v1/status
 ``` 

 **Agent Response**

 ```
http://localhost:8081/api/v1/default/respond?q=hi
 ```

 **Parsed Data**

 ```
http://localhost:8081/api/v1/default/parse?q=hi
 ```