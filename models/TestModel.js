var TestData = [];

const TestOP = {
    Create: (data) => {
        TestData.push(data);
    },
    Get: () =>{
        return TestData;
    },
}

module.exports = TestOP;