App = {
    loading:false,
    contracts: {},

    load: async () => {
        await App.loadAccount()
        await App.loadContract()
        await App.render()
        web3.eth.defaultAccount = App.account;
    },

    loadAccount: async () => {
        if (window.ethereum) {
            console.log("Connecting to Metamask...")
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                window.web3 = new Web3(window.ethereum);
                App.account = accounts[0];
                console.log("Connected to Metamask account:", App.account);
                return true;
            } catch (e) {
                console.log("Error connecting to Metamask:", e);
                return false;
            }
        }
        console.log("Metamask not found");
        return false;
    },

    renderTask: async () => {
        const taskCount = await App.todoList.taskCount()
        const $taskTemplate = $('.taskTemplate')

        for (let i = 1 ; i<= taskCount; i++){
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2]

            // Create the html for the task
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
            .prop('name', taskId)
            .prop('checked', taskCompleted)
            // .on('click', App.toggleCompleted)

            if(taskCompleted){
                $('#completedTaskList').append($newTaskTemplate)
            } else {
                $('#taskList').append($newTaskTemplate)
            }

            $newTaskTemplate.show()
        }
    },

    loadContract: async () =>{
        const todoList = await $.getJSON('ToDoList.json')
        App.contracts.ToDoList = TruffleContract(todoList)
        App.contracts.ToDoList.setProvider(web3.currentProvider)
        App.todoList = await App.contracts.ToDoList.deployed()
    },

    render: async () => {
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        $("#account").html(App.account)

        await App.renderTask()

        App.setLoading(false)
    },

    createTask: async () => {
        console.log("create task : "+App.account)
        App.setLoading(true)
        const content = $('#newTask').val()
        await App.todoList.createTask(content)
        window.location.reload()
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})

