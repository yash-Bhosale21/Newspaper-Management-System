USE newspaper_management;

CREATE TABLE IF NOT EXISTS subscribers (
    subscriber_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    subscription_status ENUM('Active','Paused','Cancelled') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS publications (
    publication_id INT AUTO_INCREMENT PRIMARY KEY,
    publication_name VARCHAR(100) NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_agents (
    agent_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    agent_id INT,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES delivery_agents(agent_id)
);

CREATE TABLE IF NOT EXISTS bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    subscriber_id INT NOT NULL,
    billing_month DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Pending','Paid') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriber_id) REFERENCES subscribers(subscriber_id)
);

CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    subscriber_id INT NOT NULL,
    complaint_details TEXT NOT NULL,
    complaint_date DATE NOT NULL,
    status ENUM('Open','In Progress','Resolved') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriber_id) REFERENCES subscribers(subscriber_id)
);

CREATE TABLE IF NOT EXISTS holiday_pauses (
    pause_id INT AUTO_INCREMENT PRIMARY KEY,
    subscriber_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscriber_id) REFERENCES subscribers(subscriber_id)
);