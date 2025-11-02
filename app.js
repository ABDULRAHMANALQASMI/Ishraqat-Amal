document.addEventListener('DOMContentLoaded', () => {
    // 1. التعامل مع إرسال نموذج تقديم الطلب (في index.html)
    const form = document.getElementById('helpForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
    }

    // 2. التعامل مع عرض البيانات في جدول لوحة المشرف (في admin.html)
    const adminTableBody = document.querySelector('#requestsTable tbody');
    if (adminTableBody) {
        displayAdminData(adminTableBody);
    }
});

/**
 * وظيفة للتحقق من صحة المدخلات وإرسال النموذج
 * @param {Event} event - حدث الإرسال
 */
function handleFormSubmission(event) {
    event.preventDefault(); // منع الإرسال الافتراضي

    const form = event.target;
    // التأكد من أن النموذج صالح وفقاً لمتطلبات HTML (required fields)
    if (!form.checkValidity()) {
        // إذا كان غير صالح، ستقوم المتصفحات بعرض رسائل الخطأ الافتراضية
        return;
    }

    // 1. جمع البيانات
    const formData = {
        fullName: form.querySelector('#fullName').value,
        civilId: form.querySelector('#civilId').value,
        phone: form.querySelector('#phone').value,
        applicationYear: form.querySelector('#applicationYear').value,
        requestType: form.querySelector('#requestType').value,
        maritalStatus: form.querySelector('#maritalStatus').value,
        income: form.querySelector('#income').value,
        jobTitle: form.querySelector('#jobTitle').value,
        hasProperty: form.querySelector('input[name="hasProperty"]:checked')?.value || 'غير محدد',
        propertiesDetails: form.querySelector('#propertiesDetails').value,
        submissionDate: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Muscat' })
    };

    // 2. تخزين البيانات
    saveDataToLocalStorage(formData);

    // 3. تحديث واجهة المستخدم
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '<p style="color: var(--accent); font-weight: 600;">✅ تم إرسال طلبك بنجاح! سيتم مراجعته.</p>';
    form.reset(); // تفريغ النموذج بعد الإرسال

    // إزالة رسالة النجاح بعد 5 ثوانٍ
    setTimeout(() => {
        statusDiv.innerHTML = '';
    }, 5000);
}

/**
 * وظيفة لجلب البيانات المخزنة من localStorage
 * @returns {Array<Object>} قائمة الطلبات
 */
function getStoredRequests() {
    const requestsJson = localStorage.getItem('landRequests');
    return requestsJson ? JSON.parse(requestsJson) : [];
}

/**
 * وظيفة لتخزين بيانات الطلب الجديد في localStorage
 * @param {Object} data - بيانات الطلب الجديد
 */
function saveDataToLocalStorage(data) {
    const requests = getStoredRequests();
    requests.push(data);
    localStorage.setItem('landRequests', JSON.stringify(requests));
}

/**
 * وظيفة لعرض البيانات في جدول لوحة المشرف
 * @param {HTMLElement} tableBody - العنصر <tbody> للجدول
 */
function displayAdminData(tableBody) {
    const requests = getStoredRequests();
    tableBody.innerHTML = ''; // تفريغ الصفوف التجريبية

    if (requests.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">لا توجد طلبات مدخلة حاليًا.</td></tr>';
        return;
    }

    // عكس الترتيب لعرض الأحدث أولاً
    requests.slice().reverse().forEach((request, index) => {
        const row = tableBody.insertRow();
        
        // البيانات التي تم عرضها في جدول admin.html (للتناسق)
        row.insertCell().textContent = request.civilId;
        row.insertCell().textContent = request.fullName;
        row.insertCell().textContent = request.applicationYear;
        row.insertCell().textContent = request.maritalStatus;
        row.insertCell().textContent = `${request.income} ر.ع`;
        row.insertCell().textContent = request.hasProperty === 'نعم' ? 'نعم' : 'لا';
        
        // زر الإجراءات
        const actionCell = row.insertCell();
        const detailButton = document.createElement('button');
        detailButton.className = 'btn small';
        detailButton.style.backgroundColor = 'var(--primary-dark)';
        detailButton.textContent = 'عرض التفاصيل';
        
        // إضافة وظيفة لعرض البيانات الكاملة عند الضغط على الزر
        detailButton.addEventListener('click', () => {
            alert(
                `تفاصيل طلب ${request.fullName}:\n` +
                `السنة: ${request.applicationYear}\n` +
                `الوظيفة: ${request.jobTitle}\n` +
                `الدخل: ${request.income} ر.ع\n` +
                `الأملاك: ${request.propertiesDetails || 'لا يوجد'}\n` +
                `تاريخ الإرسال: ${request.submissionDate}`
            );
        });
        actionCell.appendChild(detailButton);
    });
}
