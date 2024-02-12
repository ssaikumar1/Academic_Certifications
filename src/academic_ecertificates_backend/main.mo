import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import RBTree "mo:base/RBTree";
import LocalDateTime "mo:datetime/LocalDateTime";

actor {
  type Grad_cert = {
    id : Text;
    name : Text;
    regd_no : Text;
    branch : Text;
    grad_date : Text;
  };

  type University = {
    name : Text;
    address : Text;
    phno : Nat;
    email : Text;
    estd_yr : Nat;
  };

  let indianTimezone : LocalDateTime.TimeZone = #fixed(#seconds(19800));
  var universities = RBTree.RBTree<Principal, University>(Principal.compare);
  var certificates = RBTree.RBTree<Principal, [Grad_cert]>(Principal.compare);

  private func getDate() : Text {
    let dateTime : LocalDateTime.LocalDateTime = LocalDateTime.now(indianTimezone);
    let dateTimeText : Text = LocalDateTime.toTextFormatted(dateTime, #custom({ format = "YYYY-MM-DD"; locale = null }));
    return dateTimeText;
  };

  public shared query (msg) func isAccountExists() : async {
    statusCode : Nat;
    msg : Text;
  } {
    if (not Principal.isAnonymous(msg.caller)) {
      var university = universities.get(msg.caller);
      switch (university) {
        case (null) {
          return { statusCode = 200; msg = "doesntexist" };
        };
        case (?university) {
          return { statusCode = 200; msg = "exist" };
        };
      };
    } else {
      return {
        statusCode = 404;
        msg = "Connect Wallet To Access This Function";
      };
    };
  };

  public shared (msg) func registerUniversity(name : Text, address : Text, phno : Nat, email : Text, estd_yr : Nat) : async {
    statusCode : Nat;
    msg : Text;
  } {
    if (not Principal.isAnonymous(msg.caller)) {
      var uni = universities.get(msg.caller);
      switch (uni) {
        case (null) {
          var univrsty : University = {
            name = name;
            address = address;
            phno = phno;
            email = email;
            estd_yr = estd_yr;
          };
          universities.put(msg.caller, univrsty);
          return {
            statusCode = 200;
            msg = "University Account Created Successfully.!!";
          };
        };
        case (?uni) {
          return {
            statusCode = 400;
            msg = "University Already Exists, Redirecting to Dashboard...";
          };
        };
      };
    } else {
      return {
        statusCode = 404;
        msg = "Connect Wallet To Access This Function";
      };
    };
  };

  public shared (msg) func addCertificate(name : Text, regd_no : Text, branch : Text) : async {
    statusCode : Nat;
    msg : Text;
  } {
    if (not Principal.isAnonymous(msg.caller)) {
      var univ = universities.get(msg.caller);
      switch (univ) {
        case (null) {
          return {
            statusCode = 403;
            msg = "Create a Account to Access this Method";
          };
        };
        case (?univ) {
          var certs = certificates.get(msg.caller);
          var id : Text = "";
          switch (certs) {
            case (null) {
              id := Text.concat(Text.concat(Principal.toText(msg.caller), "//"), Nat.toText(0));
              var grad_certs = Array.make<Grad_cert>({
                id = id;
                name = name;
                regd_no = regd_no;
                branch = branch;
                grad_date = getDate();
              });
              certificates.put(msg.caller, grad_certs);
            };
            case (?certs) {
              id := Text.concat(Text.concat(Principal.toText(msg.caller), "//"), Nat.toText(Array.size<Grad_cert>(certs)));
              var grad_certs : [Grad_cert] = Array.append<Grad_cert>(certs, Array.make<Grad_cert>({ id = id; name = name; regd_no = regd_no; branch = branch; grad_date = getDate() }));
              certificates.put(msg.caller, grad_certs);
            };
          };
          return {
            statusCode = 200;
            msg = id;
          };
        };
      };
    } else {
      return {
        statusCode = 404;
        msg = "Connect Wallet To Access This Function";
      };
    };
  };

  public query func getCertificate(uuid : Text) : async {
    statusCode : Nat;
    cert : ?Grad_cert;
    university : ?University;
    msg : Text;
  } {
    let words = Text.split(uuid, #text "//");
    if (Iter.size<Text>(words) == 2) {
      let words = Text.split(uuid, #text "//");
      var p = words.next();
      var principal : Principal = Principal.fromText("un4fu-tqaaa-aaaab-qadjq-cai");
      switch (p) {
        case (null) {
          return {
            statusCode = 400;
            cert = null;
            university = null;
            msg = "Invalid Id Provided";
          };
        };
        case (?p) {
          try {
            principal := Principal.fromText(p);
          } catch (e) {
            return {
              statusCode = 400;
              cert = null;
              university = null;
              msg = "Invalid Id Provided";
            };
          };
        };
      };
      var n = words.next();
      var id : ?Nat = null;
      switch (n) {
        case (null) {
          return {
            statusCode = 400;
            cert = null;
            university = null;
            msg = "Invalid Id Provided";
          };
        };
        case (?n) {
          id := Nat.fromText(n);
        };
      };

      let certs = certificates.get(principal);
      switch (certs) {
        case (null) {
          return {
            statusCode = 400;
            cert = null;
            university = null;
            msg = "Invalid Id Provided";
          };
        };
        case (?certs) {
          switch (id) {
            case (null) {
              return {
                statusCode = 400;
                cert = null;
                university = null;
                msg = "Invalid Id Provided";
              };
            };
            case (?id) {
              var cert = Array.subArray<Grad_cert>(certs, id, 1);
              var uni = universities.get(principal);
              switch (uni) {
                case (null) {
                  return {
                    statusCode = 400;
                    cert = null;
                    university = null;
                    msg = "Invalid Id Provided";
                  };
                };
                case (?uni) {
                  return {
                    statusCode = 200;
                    cert = ?cert[0];
                    university = ?uni;
                    msg = "Certificate Retrived Successfully.!!";
                  };
                };
              };
            };
          };
        };
      };

    } else {
      return {
        statusCode = 400;
        cert = null;
        university = null;
        msg = "Invalid Id Provided";
      };
    };
  };

  public shared query (msg) func getUniversity(principal : ?Principal) : async {
    statusCode : Nat;
    university : ?University;
    certs : ?[Grad_cert];
    msg : Text;
  } {
    switch (principal) {
      case (null) {
        var university = universities.get(msg.caller);
        switch (university) {
          case (null) {
            return {
              statusCode = 403;
              university = null;
              certs = null;
              msg = "Register with a Account to Access this Method";
            };
          };
          case (?university) {
            var cers = certificates.get(msg.caller);
            return {
              statusCode = 200;
              university = ?university;
              certs = cers;
              msg = "Retrived University Details Successfully..";
            };
          };
        };
      };
      case (?principal) {
        var university = universities.get(principal);
        switch (university) {
          case (null) {
            return {
              statusCode = 403;
              university = null;
              certs = null;
              msg = "Unknown/Invalid University Account is Given";
            };
          };
          case (?university) {
            var cers = certificates.get(principal);
            return {
              statusCode = 200;
              university = ?university;
              certs = cers;
              msg = "Retrived University Details Successfully..";
            };
          };
        };
      };
    };
  };

  type StableUniversity = (Principal, University); // type to hold stable university

  stable var stableUniversities : [StableUniversity] = []; // stable variable to hold universities

  type StableCertificates = (Principal, [Grad_cert]);

  stable var stableCertificates : [StableCertificates] = [];

  func serailize() {
    // function to store universities in stable variable while upgrade
    stableUniversities := Iter.toArray(universities.entries());
  };

  func serailizeCertificates() {
    stableCertificates := Iter.toArray(certificates.entries());
  };

  func deserialize() {
    // function to store universities from stable variable to RBTree after upgrade
    let newUniversities = RBTree.RBTree<Principal, University>(Principal.compare);
    let tuples = Iter.fromArray(stableUniversities);
    for (tuple in tuples) {
      let (key, value) = tuple;
      newUniversities.put(key, value);
    };
    universities := newUniversities;
  };

  func deserializeCertificates() {
    let newCertificates = RBTree.RBTree<Principal, [Grad_cert]>(Principal.compare);
    let tuples = Iter.fromArray(stableCertificates);
    for (tuple in tuples) {
      let (key, value) = tuple;
      newCertificates.put(key, value);
    };
    certificates := newCertificates;
  };

  system func preupgrade() {
    serailize();
    serailizeCertificates();
  };

  system func postupgrade() {
    deserialize();
    deserializeCertificates();
  };
};
